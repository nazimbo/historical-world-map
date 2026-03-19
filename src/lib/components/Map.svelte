<script lang="ts">
	/**
	 * @component Map
	 *
	 * Renders an interactive MapLibre GL map with historical territory boundaries.
	 * Supports light/dark theme switching with different basemap tiles and territory colors.
	 */

	import { onMount, onDestroy } from 'svelte';
	import maplibregl from 'maplibre-gl';
	import type { GeoJSON } from 'geojson';

	interface Props {
		geojsonData: GeoJSON | null;
		theme: 'light' | 'dark';
		onTerritoryClick: (properties: Record<string, unknown>) => void;
		onTerritoryDeselect: () => void;
	}

	let { geojsonData, theme, onTerritoryClick, onTerritoryDeselect }: Props = $props();

	let mapContainer: HTMLDivElement;
	let map: maplibregl.Map | undefined;
	let mapReady = $state(false);
	let selectedFeatureId: string | number | undefined = undefined;
	let hoveredFeatureId: number | undefined = undefined;
	let currentTileVariant: string | undefined;

	interface MapThemeConfig {
		tiles: string;
		fill: { selected: string; named: string; unnamed: string };
		opacity: { selected: number; hover: number; named: number; unnamed: number };
		line: { selected: string; hover: string; default: string };
		lineWidth: { selected: number; hover: number; default: number };
	}

	const THEMES: Record<'light' | 'dark', MapThemeConfig> = {
		light: {
			tiles: 'light_all',
			fill: { selected: '#f39c12', named: '#3498db', unnamed: '#95a5a6' },
			opacity: { selected: 0.9, hover: 0.9, named: 0.7, unnamed: 0.4 },
			line: {
				selected: 'rgba(255, 255, 255, 1)',
				hover: 'rgba(255, 255, 255, 1)',
				default: 'rgba(255, 255, 255, 0.8)'
			},
			lineWidth: { selected: 4, hover: 3, default: 2 }
		},
		dark: {
			tiles: 'dark_all',
			fill: { selected: '#f0b429', named: '#4ecdc4', unnamed: '#546577' },
			opacity: { selected: 0.85, hover: 0.75, named: 0.55, unnamed: 0.25 },
			line: {
				selected: 'rgba(255, 255, 255, 0.7)',
				hover: 'rgba(255, 255, 255, 0.5)',
				default: 'rgba(255, 255, 255, 0.2)'
			},
			lineWidth: { selected: 3, hover: 2, default: 1 }
		}
	};

	const EMPTY_GEOJSON: GeoJSON.FeatureCollection = {
		type: 'FeatureCollection',
		features: []
	};

	const HAS_NAME: maplibregl.ExpressionSpecification = [
		'to-boolean',
		['coalesce', ['get', 'NAME'], ['get', 'name'], ['get', 'NAME_EN']]
	];

	function buildFillColor(t: MapThemeConfig): maplibregl.ExpressionSpecification {
		return [
			'case',
			['boolean', ['feature-state', 'selected'], false],
			t.fill.selected,
			['case', HAS_NAME, t.fill.named, t.fill.unnamed]
		];
	}

	function buildFillOpacity(t: MapThemeConfig): maplibregl.ExpressionSpecification {
		return [
			'case',
			['boolean', ['feature-state', 'selected'], false],
			t.opacity.selected,
			[
				'case',
				['boolean', ['feature-state', 'hover'], false],
				t.opacity.hover,
				['case', HAS_NAME, t.opacity.named, t.opacity.unnamed]
			]
		];
	}

	function buildLineColor(t: MapThemeConfig): maplibregl.ExpressionSpecification {
		return [
			'case',
			['boolean', ['feature-state', 'selected'], false],
			t.line.selected,
			[
				'case',
				['boolean', ['feature-state', 'hover'], false],
				t.line.hover,
				t.line.default
			]
		];
	}

	function buildLineWidth(t: MapThemeConfig): maplibregl.ExpressionSpecification {
		return [
			'case',
			['boolean', ['feature-state', 'selected'], false],
			t.lineWidth.selected,
			[
				'case',
				['boolean', ['feature-state', 'hover'], false],
				t.lineWidth.hover,
				t.lineWidth.default
			]
		];
	}

	function tileUrls(variant: string) {
		return ['a', 'b', 'c', 'd'].map(
			(s) => `https://${s}.basemaps.cartocdn.com/${variant}/{z}/{x}/{y}.png`
		);
	}

	onMount(() => {
		const t = THEMES[theme];
		currentTileVariant = t.tiles;

		map = new maplibregl.Map({
			container: mapContainer,
			style: {
				version: 8,
				sources: {
					carto: {
						type: 'raster',
						tiles: tileUrls(t.tiles),
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
					'fill-color': buildFillColor(t),
					'fill-opacity': buildFillOpacity(t)
				}
			});

			map.addLayer({
				id: 'territories-line',
				type: 'line',
				source: 'territories',
				paint: {
					'line-color': buildLineColor(t),
					'line-width': buildLineWidth(t)
				}
			});

			mapReady = true;
		});

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

	// React to theme changes: swap basemap tiles and update territory paint
	$effect(() => {
		if (!map || !mapReady) return;
		const t = THEMES[theme];

		if (currentTileVariant !== t.tiles) {
			currentTileVariant = t.tiles;
			if (map.getLayer('carto-tiles')) map.removeLayer('carto-tiles');
			if (map.getSource('carto')) map.removeSource('carto');
			map.addSource('carto', {
				type: 'raster',
				tiles: tileUrls(t.tiles),
				tileSize: 256,
				attribution:
					'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
			});
			map.addLayer(
				{
					id: 'carto-tiles',
					type: 'raster',
					source: 'carto',
					minzoom: 0,
					maxzoom: 19
				},
				'territories-fill'
			);
		}

		map.setPaintProperty('territories-fill', 'fill-color', buildFillColor(t));
		map.setPaintProperty('territories-fill', 'fill-opacity', buildFillOpacity(t));
		map.setPaintProperty('territories-line', 'line-color', buildLineColor(t));
		map.setPaintProperty('territories-line', 'line-width', buildLineWidth(t));
	});

	function updateMapData(data: GeoJSON) {
		if (!map) return;
		const source = map.getSource('territories') as maplibregl.GeoJSONSource | undefined;
		if (source) {
			map.removeFeatureState({ source: 'territories' });
			selectedFeatureId = undefined;
			hoveredFeatureId = undefined;
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
