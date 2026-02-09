/**
 * DataService manages loading, caching, and preloading of historical map data.
 *
 * Key design decisions:
 * - Uses a Web Worker for fetching and converting TopoJSON to GeoJSON so the
 *   main thread stays responsive during large file loads.
 * - Falls back to main-thread fetching automatically if the Worker fails to
 *   initialize (e.g. in environments that don't support module workers).
 * - Maintains an LRU cache whose size adapts to device memory (10 on
 *   low-memory devices, 25 otherwise) to balance memory use vs. reload speed.
 * - Preloads adjacent periods during idle time so forward/backward navigation
 *   is instant in most cases.
 * - Coalesces rapid period changes: if the user drags the slider quickly,
 *   only the most recently requested period is actually loaded.
 *
 * @module dataService
 */

import type { GeoJSON } from 'geojson';
import * as topojson from 'topojson-client';
import type { Topology } from 'topojson-specification';
import { PERIODS } from './periodsConfig.js';
import type { WorkerRequest, WorkerResponse } from './worker.js';

// Safari doesn't support requestIdleCallback — fall back to setTimeout.
const rIC =
	typeof requestIdleCallback === 'function'
		? requestIdleCallback
		: (cb: () => void) => setTimeout(cb, 1) as unknown as number;
const cIC =
	typeof cancelIdleCallback === 'function'
		? cancelIdleCallback
		: (id: number) => clearTimeout(id);

/**
 * Generic LRU (Least Recently Used) cache backed by a Map.
 * Exploits Map's insertion-order iteration: the first entry is the least
 * recently used. On access, entries are moved to the end (most recent).
 */
class LRUCache<K, V> {
	private map = new Map<K, V>();
	private maxSize: number;

	constructor(maxSize: number) {
		this.maxSize = maxSize;
	}

	get(key: K): V | undefined {
		const value = this.map.get(key);
		if (value !== undefined) {
			// Move to end (most recently used)
			this.map.delete(key);
			this.map.set(key, value);
		}
		return value;
	}

	set(key: K, value: V): void {
		if (this.map.has(key)) {
			this.map.delete(key);
		} else if (this.map.size >= this.maxSize) {
			// Evict least recently used (first entry)
			const firstKey = this.map.keys().next().value!;
			this.map.delete(firstKey);
		}
		this.map.set(key, value);
	}

	has(key: K): boolean {
		return this.map.has(key);
	}

	get size(): number {
		return this.map.size;
	}

	clear(): void {
		this.map.clear();
	}
}

/**
 * Determine cache capacity based on device memory.
 * Uses the Navigator.deviceMemory API (Chrome/Edge) when available.
 * Returns 10 on devices with <= 2 GB RAM, 25 otherwise.
 */
function getCacheSize(): number {
	if (typeof navigator !== 'undefined' && 'deviceMemory' in navigator) {
		const mem = (navigator as { deviceMemory?: number }).deviceMemory ?? 4;
		return mem <= 2 ? 10 : 25;
	}
	return 25;
}

/**
 * Service responsible for loading historical period data, managing the
 * data cache, and coordinating the Web Worker.
 *
 * Usage:
 * ```ts
 * const service = new DataService();
 * const geojson = await service.loadPeriod(0); // load first period
 * service.destroy(); // clean up worker + cache
 * ```
 */
export class DataService {
	private worker: Worker | null = null;
	private workerFailed = false;
	private cache: LRUCache<string, GeoJSON>;
	/** Index of the most recently requested period (for request coalescing). */
	private pendingIndex: number | null = null;
	/** Guard to prevent concurrent loadPeriod executions. */
	private isLoading = false;
	/** Monotonic counter for correlating worker request/response pairs. */
	private requestId = 0;
	private pendingRequests = new Map<
		number,
		{ resolve: (data: GeoJSON) => void; reject: (err: Error) => void }
	>();
	private idleCallbackId: number | null = null;

	constructor() {
		this.cache = new LRUCache<string, GeoJSON>(getCacheSize());
	}

	private getWorker(): Worker | null {
		if (this.workerFailed) return null;

		if (!this.worker) {
			try {
				this.worker = new Worker(new URL('./worker.ts', import.meta.url), {
					type: 'module'
				});
				this.worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
					const { id, geojson, error } = e.data;
					const pending = this.pendingRequests.get(id);
					if (pending) {
						this.pendingRequests.delete(id);
						if (error) {
							pending.reject(new Error(error));
						} else if (geojson) {
							pending.resolve(geojson);
						}
					}
				};
				this.worker.onerror = (e) => {
					console.warn('Worker error, falling back to main thread:', e.message);
					this.workerFailed = true;
					// Reject all pending requests so they can be retried on main thread
					for (const [id, pending] of this.pendingRequests) {
						pending.reject(new Error('Worker failed'));
						this.pendingRequests.delete(id);
					}
					this.worker?.terminate();
					this.worker = null;
				};
			} catch {
				console.warn('Worker creation failed, using main thread fallback');
				this.workerFailed = true;
				return null;
			}
		}
		return this.worker;
	}

	/** Send a load request to the Web Worker. Rejects after 30s if the worker hangs. */
	private fetchViaWorker(file: string): Promise<GeoJSON> {
		const worker = this.getWorker();
		if (!worker) return Promise.reject(new Error('Worker not available'));

		const id = ++this.requestId;
		return new Promise<GeoJSON>((resolve, reject) => {
			// Timeout after 30s in case the worker hangs
			const timeout = setTimeout(() => {
				this.pendingRequests.delete(id);
				reject(new Error(`Worker timeout loading ${file}`));
			}, 30000);

			this.pendingRequests.set(id, {
				resolve: (data) => {
					clearTimeout(timeout);
					resolve(data);
				},
				reject: (err) => {
					clearTimeout(timeout);
					reject(err);
				}
			});
			const msg: WorkerRequest = { id, file };
			worker.postMessage(msg);
		});
	}

	/** Fetch and convert TopoJSON on the main thread (fallback path). */
	private async fetchOnMainThread(file: string): Promise<GeoJSON> {
		const response = await fetch(`/data/${file}`);
		if (!response.ok) {
			throw new Error(`Failed to load ${file}: ${response.statusText}`);
		}
		const topoData: Topology = await response.json();
		const objectKey = Object.keys(topoData.objects)[0];
		return topojson.feature(topoData, topoData.objects[objectKey]) as unknown as GeoJSON;
	}

	/** Fetch data via worker, falling back to main thread on failure. */
	private async fetchData(file: string): Promise<GeoJSON> {
		const worker = this.getWorker();
		if (worker) {
			try {
				return await this.fetchViaWorker(file);
			} catch {
				// Worker failed for this request; try main thread
				console.warn('Worker request failed, retrying on main thread');
			}
		}
		return this.fetchOnMainThread(file);
	}

	/**
	 * Load the GeoJSON data for the period at `index`.
	 *
	 * If a load is already in progress, the new index is stored and will be
	 * loaded once the current fetch completes (request coalescing). This means
	 * rapidly dragging the slider results in at most one in-flight fetch at a
	 * time, with only the latest requested period actually returned.
	 *
	 * @returns The GeoJSON data, or `null` if the request was superseded.
	 */
	async loadPeriod(index: number): Promise<GeoJSON | null> {
		this.pendingIndex = index;

		if (this.isLoading) return null;

		this.isLoading = true;

		try {
			while (this.pendingIndex !== null) {
				const targetIndex = this.pendingIndex;
				this.pendingIndex = null;

				const period = PERIODS[targetIndex];
				const cacheKey = period.file;
				let geojsonData: GeoJSON;

				if (this.cache.has(cacheKey)) {
					geojsonData = this.cache.get(cacheKey)!;
				} else {
					geojsonData = await this.fetchData(period.file);
					this.cache.set(cacheKey, geojsonData);
				}

				// Only return if no newer request arrived during fetch
				if (this.pendingIndex === null) {
					this.schedulePreload(targetIndex);
					return geojsonData;
				}
			}
		} finally {
			this.isLoading = false;
		}

		return null;
	}

	/** Preload the periods immediately before and after `currentIndex` during idle time. */
	private schedulePreload(currentIndex: number): void {
		if (this.idleCallbackId !== null) {
			cIC(this.idleCallbackId);
		}

		this.idleCallbackId = rIC(() => {
			this.idleCallbackId = null;
			const adjacent = [currentIndex - 1, currentIndex + 1];
			for (const idx of adjacent) {
				if (idx >= 0 && idx < PERIODS.length) {
					const file = PERIODS[idx].file;
					if (!this.cache.has(file)) {
						this.fetchData(file)
							.then((data) => this.cache.set(file, data))
							.catch(() => {
								/* preload failure is silent */
							});
					}
				}
			}
		});
	}

	/**
	 * Eagerly preload the period two steps ahead in the given direction.
	 * Called when the user navigates so the next-next period is likely cached
	 * by the time they reach it.
	 *
	 * @param direction 1 for forward, -1 for backward.
	 */
	preloadDirection(currentIndex: number, direction: number): void {
		const targetIdx = currentIndex + direction * 2;
		if (targetIdx >= 0 && targetIdx < PERIODS.length) {
			const file = PERIODS[targetIdx].file;
			if (!this.cache.has(file)) {
				this.fetchData(file)
					.then((data) => this.cache.set(file, data))
					.catch(() => {
						/* preload failure is silent */
					});
			}
		}
	}

	/** Terminate the worker, cancel pending preloads, and clear the cache. */
	destroy(): void {
		if (this.idleCallbackId !== null) {
			cIC(this.idleCallbackId);
		}
		if (this.worker) {
			this.worker.terminate();
			this.worker = null;
		}
		this.cache.clear();
		this.pendingRequests.clear();
	}
}
