<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import maplibregl from 'maplibre-gl';
	import type { GeoJSON } from 'geojson';

	/**
	 * @component Map
	 *
	 * Renders an interactive MapLibre GL map with historical territory boundaries.
	 * Territory polygons are styled with three visual states managed via MapLibre
	 * feature-state (no data re-render required):
	 *   - Default: blue (named territories) or grey (unnamed)
	 *   - Hover: increased opacity + thicker border
	 *   - Selected: orange fill with white border
	 */

	interface Props {
		/** GeoJSON FeatureCollection of territories to display. Null during initial load. */
		geojsonData: GeoJSON | null;
		/** Called when a territory polygon is clicked, with the feature's properties. */
		onTerritoryClick: (properties: Record<string, unknown>) => void;
		/** Called when the user clicks empty map area (deselects current territory). */
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

			// generateId: true assigns sequential numeric IDs to features,
			// which is required for setFeatureState (hover/selection) to work.
			map.addSource('territories', {
				type: 'geojson',
				data: EMPTY_GEOJSON,
				generateId: true
			});

			// Fill layer: uses nested MapLibre expressions to determine color
			// and opacity based on feature-state (selected, hover) and whether
			// the feature has a name property. Priority order:
			//   1. Selected (orange, 0.9 opacity)
			//   2. Hovered (keeps base color, 0.9 opacity)
			//   3. Named territory (blue, 0.7 opacity)
			//   4. Unnamed territory (grey, 0.4 opacity)
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

			// Border layer: white borders that thicken on hover/selection to
			// provide visual feedback without re-rendering geometry.
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

		// Generic click handler: fires for *all* clicks on the map. If the click
		// didn't hit a territory polygon, clear the current selection. This is
		// separate from the territories-fill click handler above because MapLibre
		// fires layer-specific handlers only when features are hit.
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
