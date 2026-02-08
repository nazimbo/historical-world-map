<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import maplibregl from 'maplibre-gl';
	import type { GeoJSON } from 'geojson';

	interface Props {
		geojsonData: GeoJSON | null;
		onTerritoryClick: (properties: Record<string, unknown>) => void;
		onTerritoryDeselect: () => void;
	}

	let { geojsonData, onTerritoryClick, onTerritoryDeselect }: Props = $props();

	let mapContainer: HTMLDivElement;
	let map: maplibregl.Map | undefined;
	let mapReady = $state(false);
	let selectedFeatureId: string | number | undefined = undefined;

	const MAP_COLORS = {
		selected: '#f39c12',
		named: '#3498db',
		unnamed: '#95a5a6'
	} as const;

	const EMPTY_GEOJSON: GeoJSON.FeatureCollection = {
		type: 'FeatureCollection',
		features: []
	};

	onMount(() => {
		map = new maplibregl.Map({
			container: mapContainer,
			style: {
				version: 8,
				sources: {
					carto: {
						type: 'raster',
						tiles: [
							'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
							'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
							'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
							'https://d.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
						],
						tileSize: 256,
						attribution:
							'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
					}
				},
				layers: [
					{
						id: 'carto-tiles',
						type: 'raster',
						source: 'carto',
						minzoom: 0,
						maxzoom: 19
					}
				]
			},
			center: [0, 20],
			zoom: 2,
			minZoom: 2,
			maxZoom: 6
		});

		map.addControl(new maplibregl.NavigationControl(), 'top-left');
		map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');

		map.on('load', () => {
			if (!map) return;

			map.addSource('territories', {
				type: 'geojson',
				data: EMPTY_GEOJSON,
				generateId: true
			});

			map.addLayer({
				id: 'territories-fill',
				type: 'fill',
				source: 'territories',
				paint: {
					'fill-color': [
						'case',
						['boolean', ['feature-state', 'selected'], false],
						MAP_COLORS.selected,
						[
							'case',
							[
								'any',
								['has', 'NAME'],
								['has', 'name'],
								['has', 'NAME_EN']
							],
							MAP_COLORS.named,
							MAP_COLORS.unnamed
						]
					],
					'fill-opacity': [
						'case',
						['boolean', ['feature-state', 'selected'], false],
						0.9,
						[
							'case',
							['boolean', ['feature-state', 'hover'], false],
							0.9,
							[
								'case',
								[
									'any',
									['has', 'NAME'],
									['has', 'name'],
									['has', 'NAME_EN']
								],
								0.7,
								0.4
							]
						]
					]
				}
			});

			map.addLayer({
				id: 'territories-line',
				type: 'line',
				source: 'territories',
				paint: {
					'line-color': [
						'case',
						['boolean', ['feature-state', 'selected'], false],
						'rgba(255, 255, 255, 1)',
						[
							'case',
							['boolean', ['feature-state', 'hover'], false],
							'rgba(255, 255, 255, 1)',
							'rgba(255, 255, 255, 0.8)'
						]
					],
					'line-width': [
						'case',
						['boolean', ['feature-state', 'selected'], false],
						4,
						[
							'case',
							['boolean', ['feature-state', 'hover'], false],
							3,
							2
						]
					]
				}
			});

			// Mark map as ready — this triggers the $effect to apply any pending data
			mapReady = true;
		});

		let hoveredFeatureId: number | undefined;

		map.on('mousemove', 'territories-fill', (e) => {
			if (!map || !e.features || e.features.length === 0) return;

			map.getCanvas().style.cursor = 'pointer';

			const feature = e.features[0];
			if (hoveredFeatureId !== undefined) {
				map.setFeatureState({ source: 'territories', id: hoveredFeatureId }, { hover: false });
			}
			hoveredFeatureId = feature.id as number;
			map.setFeatureState({ source: 'territories', id: hoveredFeatureId }, { hover: true });
		});

		map.on('mouseleave', 'territories-fill', () => {
			if (!map) return;
			map.getCanvas().style.cursor = '';
			if (hoveredFeatureId !== undefined) {
				map.setFeatureState({ source: 'territories', id: hoveredFeatureId }, { hover: false });
				hoveredFeatureId = undefined;
			}
		});

		map.on('click', 'territories-fill', (e) => {
			if (!map || !e.features || e.features.length === 0) return;

			const feature = e.features[0];

			if (selectedFeatureId !== undefined) {
				map.setFeatureState(
					{ source: 'territories', id: selectedFeatureId },
					{ selected: false }
				);
			}

			selectedFeatureId = feature.id as number;
			map.setFeatureState(
				{ source: 'territories', id: selectedFeatureId },
				{ selected: true }
			);

			onTerritoryClick(feature.properties as Record<string, unknown>);
		});

		map.on('click', (e) => {
			if (!map) return;
			const features = map.queryRenderedFeatures(e.point, {
				layers: ['territories-fill']
			});
			if (features.length === 0) {
				clearSelection();
				onTerritoryDeselect();
			}
		});
	});

	function updateMapData(data: GeoJSON) {
		if (!map) return;
		const source = map.getSource('territories') as maplibregl.GeoJSONSource | undefined;
		if (source) {
			if (selectedFeatureId !== undefined) {
				selectedFeatureId = undefined;
			}
			source.setData(data as GeoJSON.GeoJSON);
		}
	}

	export function clearSelection() {
		if (map && selectedFeatureId !== undefined) {
			map.setFeatureState(
				{ source: 'territories', id: selectedFeatureId },
				{ selected: false }
			);
			selectedFeatureId = undefined;
		}
	}

	// React to both geojsonData changes AND mapReady becoming true
	$effect(() => {
		if (geojsonData && mapReady) {
			updateMapData(geojsonData);
		}
	});

	onDestroy(() => {
		if (map) {
			map.remove();
			map = undefined;
		}
	});
</script>

<div class="map-container" bind:this={mapContainer}></div>

<style>
	.map-container {
		position: absolute;
		inset: 0;
	}
</style>
