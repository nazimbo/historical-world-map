import * as topojson from 'topojson-client';
import type { Topology } from 'topojson-specification';
import type { GeoJSON } from 'geojson';

export interface WorkerRequest {
	id: number;
	file: string;
}

export interface WorkerResponse {
	id: number;
	geojson?: GeoJSON;
	error?: string;
}

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
	const { id, file } = e.data;

	try {
		const response = await fetch(`/data/${file}`);
		if (!response.ok) {
			throw new Error(`Failed to load ${file}: ${response.statusText}`);
		}

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
