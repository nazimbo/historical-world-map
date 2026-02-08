<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import Map from '$lib/components/Map.svelte';
	import TimeSlider from '$lib/components/TimeSlider.svelte';
	import InfoPanel from '$lib/components/InfoPanel.svelte';
	import ErrorNotification from '$lib/components/ErrorNotification.svelte';
	import LoadingOverlay from '$lib/components/LoadingOverlay.svelte';
	import { PERIODS } from '$lib/periodsConfig.js';
	import { DataService } from '$lib/dataService.js';
	import type { GeoJSON } from 'geojson';

	let periodIndex = $state(0);
	let geojsonData = $state<GeoJSON | null>(null);
	let selectedTerritory = $state<Record<string, unknown> | null>(null);
	let isLoading = $state(true);
	let errorMessage = $state<string | null>(null);

	let dataService: DataService;
	let mapComponent: Map;
	let previousDirection = 0;

	async function loadPeriod(index: number) {
		isLoading = true;
		errorMessage = null;

		try {
			const data = await dataService.loadPeriod(index);
			if (data) {
				geojsonData = data;
				selectedTerritory = null;
			}
		} catch (err) {
			console.error('Failed to load period:', err);
			const detail = err instanceof Error ? err.message : String(err);
			errorMessage = `Failed to load historical data: ${detail}`;
		} finally {
			isLoading = false;
		}
	}

	function handlePeriodChange(newIndex: number) {
		const direction = newIndex > periodIndex ? 1 : newIndex < periodIndex ? -1 : 0;
		if (direction !== 0) {
			previousDirection = direction;
			dataService.preloadDirection(newIndex, direction);
		}
		periodIndex = newIndex;
		loadPeriod(newIndex);
	}

	function handleTerritoryClick(properties: Record<string, unknown>) {
		selectedTerritory = properties;
	}

	function handleTerritoryDeselect() {
		selectedTerritory = null;
	}

	function handleCloseInfo() {
		selectedTerritory = null;
		mapComponent?.clearSelection();
	}

	function handleRetry() {
		loadPeriod(periodIndex);
	}

	function handleDismiss() {
		errorMessage = null;
	}

	onMount(() => {
		dataService = new DataService();
		loadPeriod(0);
	});

	onDestroy(() => {
		dataService?.destroy();
	});
</script>

<svelte:head>
	<title>Historical Interactive World Map</title>
</svelte:head>

<main class="flex flex-col h-screen relative">
	<header class="header absolute top-5 left-5 right-5 z-[1000] bg-white/90 border border-gray-200 rounded-xl shadow-md px-4 py-3 text-center">
		<h1 class="text-lg font-semibold text-gray-900 m-0 inline-flex items-center gap-2 tracking-tight">
			<span aria-hidden="true">🌍</span>
			Historical Interactive World Map
		</h1>
	</header>

	<Map
		bind:this={mapComponent}
		{geojsonData}
		onTerritoryClick={handleTerritoryClick}
		onTerritoryDeselect={handleTerritoryDeselect}
	/>

	<LoadingOverlay {isLoading} />

	<TimeSlider
		periods={PERIODS}
		bind:periodIndex
		onperiodchange={handlePeriodChange}
	/>

	<InfoPanel
		territory={selectedTerritory}
		periodLabel={PERIODS[periodIndex]?.label ?? ''}
		onclose={handleCloseInfo}
	/>

	{#if errorMessage}
		<ErrorNotification
			message={errorMessage}
			onretry={handleRetry}
			ondismiss={handleDismiss}
		/>
	{/if}

	<footer class="footer absolute bottom-5 right-5 bg-white border border-gray-200 px-3 py-2 text-center text-xs rounded-xl z-[1000] shadow-sm hidden md:block">
		<p class="m-0 text-gray-600 leading-snug">
			Data source: <a
				class="text-primary font-semibold no-underline hover:text-primary-dark hover:underline transition-colors"
				href="https://github.com/aourednik/historical-basemaps"
				target="_blank"
				rel="noopener noreferrer">Historical Basemaps</a
			>
		</p>
	</footer>
</main>

<style>
	@media (max-width: 768px) {
		.header {
			top: max(env(safe-area-inset-top), 10px);
			left: max(env(safe-area-inset-left), 10px);
			right: max(env(safe-area-inset-right), 10px);
		}
	}

	@media (max-width: 480px) {
		.header {
			top: max(env(safe-area-inset-top), 8px);
			left: max(env(safe-area-inset-left), 8px);
			right: max(env(safe-area-inset-right), 8px);
			padding: 0.5rem 0.7rem;
		}

		.header :global(h1) {
			font-size: 0.95rem;
		}
	}

	@media (max-width: 360px) {
		.header {
			padding: 0.4rem 0.5rem;
		}

		.header :global(h1) {
			font-size: 0.85rem;
		}
	}

	@media (max-width: 768px) and (orientation: landscape) {
		.header {
			padding: 0.3rem 0.6rem;
		}

		.header :global(h1) {
			font-size: 0.9rem;
		}
	}
</style>
