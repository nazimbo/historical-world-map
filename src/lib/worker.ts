/**
 * Web Worker for off-main-thread data loading.
 *
 * Receives a {@link WorkerRequest} message with a TopoJSON filename,
 * fetches the file from /data/, converts it to GeoJSON using topojson-client,
 * and posts back a {@link WorkerResponse} with the result or an error string.
 *
 * This keeps the main thread responsive while loading and parsing large
 * geospatial data files. The DataService falls back to main-thread loading
 * if the worker fails to initialize.
 */

import * as topojson from 'topojson-client';
import type { Topology } from 'topojson-specification';
import type { GeoJSON } from 'geojson';

/** Message sent from DataService to the worker. */
export interface WorkerRequest {
	/** Unique request ID used to correlate responses. */
	id: number;
	/** TopoJSON filename to fetch (e.g. "world_bc3000.topojson"). */
	file: string;
}

/** Message sent from the worker back to DataService. */
export interface WorkerResponse {
	/** Request ID matching the originating WorkerRequest. */
	id: number;
	/** Converted GeoJSON data (present on success). */
	geojson?: GeoJSON;
	/** Error message (present on failure). */
	error?: string;
}

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
	const { id, file } = e.data;

	try {
		const response = await fetch(`/data/${file}`);
		if (!response.ok) {
			throw new Error(`Failed to load ${file}: ${response.statusText}`);
		}

		// TopoJSON files contain one or more named geometry objects; we take the
		// first one and convert it to a GeoJSON FeatureCollection.
		const topoData: Topology = await response.json();
		const objectKey = Object.keys(topoData.objects)[0];
		const geojson = topojson.feature(topoData, topoData.objects[objectKey]);

		const msg: WorkerResponse = { id, geojson: geojson as GeoJSON };
		self.postMessage(msg);
	} catch (err) {
		const msg: WorkerResponse = {
			id,
			error: err instanceof Error ? err.message : 'Unknown error'
		};
		self.postMessage(msg);
	}
};
