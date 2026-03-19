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

	let theme = $state<'light' | 'dark'>(
		typeof document !== 'undefined'
			? ((document.documentElement.getAttribute('data-theme') as 'light' | 'dark') ?? 'dark')
			: 'dark'
	);

	let dataService: DataService;
	let mapComponent: Map;
	let previousDirection = 0;
	let loadGeneration = 0;

	function toggleTheme() {
		theme = theme === 'dark' ? 'light' : 'dark';
		document.documentElement.setAttribute('data-theme', theme);
		localStorage.setItem('theme', theme);
		const meta = document.querySelector('meta[name="theme-color"]');
		if (meta) meta.setAttribute('content', theme === 'dark' ? '#080c14' : '#f3f4f6');
	}

	async function loadPeriod(index: number) {
		const generation = ++loadGeneration;
		isLoading = true;
		errorMessage = null;

		try {
			const data = await dataService.loadPeriod(index);
			if (generation !== loadGeneration) return;
			if (data) {
				geojsonData = data;
				selectedTerritory = null;
			}
		} catch (err) {
			if (generation !== loadGeneration) return;
			console.error('Failed to load period:', err);
			const detail = err instanceof Error ? err.message : String(err);
			errorMessage = `Failed to load historical data: ${detail}`;
		} finally {
			if (generation === loadGeneration) {
				isLoading = false;
			}
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

<main class="main-container">
	<header class="header">
		<h1>
			<span aria-hidden="true">🌍</span>
			Historical Interactive World Map
		</h1>
		<button
			class="theme-toggle"
			onclick={toggleTheme}
			aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
		>
			{#if theme === 'dark'}
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="12" cy="12" r="5"/>
					<line x1="12" y1="1" x2="12" y2="3"/>
					<line x1="12" y1="21" x2="12" y2="23"/>
					<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
					<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
					<line x1="1" y1="12" x2="3" y2="12"/>
					<line x1="21" y1="12" x2="23" y2="12"/>
					<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
					<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
				</svg>
			{:else}
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
				</svg>
			{/if}
		</button>
	</header>

	<Map
		bind:this={mapComponent}
		{geojsonData}
		{theme}
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

</main>

<style>
	.main-container {
		height: 100vh;
		height: 100dvh;
		display: flex;
		flex-direction: column;
		position: relative;
		overflow: hidden;
	}

	.header {
		position: absolute;
		top: 1.25rem;
		left: 1.25rem;
		right: 1.25rem;
		z-index: 1000;
		background: var(--glass-bg);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		border: 1px solid var(--glass-border);
		border-radius: 0.75rem;
		box-shadow: var(--glass-shadow);
		padding: 0.65rem 1rem;
		text-align: center;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.header h1 {
		font-size: 1.05rem;
		font-weight: 600;
		color: var(--text-1);
		margin: 0;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		letter-spacing: -0.01em;
	}

	.theme-toggle {
		position: absolute;
		right: 0.75rem;
		top: 50%;
		transform: translateY(-50%);
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--hover-bg);
		border: 1px solid var(--glass-border);
		border-radius: 0.5rem;
		color: var(--text-2);
		cursor: pointer;
		transition: color 0.2s, background-color 0.2s;
		padding: 0;
	}

	.theme-toggle:hover {
		color: var(--text-1);
		background: var(--separator);
	}

	.theme-toggle svg {
		width: 1.1rem;
		height: 1.1rem;
	}

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

		.header h1 {
			font-size: 0.95rem;
		}

		.theme-toggle {
			right: 0.5rem;
		}
	}

	@media (max-width: 360px) {
		.header {
			padding: 0.4rem 0.5rem;
		}

		.header h1 {
			font-size: 0.85rem;
		}

		.theme-toggle {
			width: 1.75rem;
			height: 1.75rem;
			right: 0.4rem;
		}

		.theme-toggle svg {
			width: 0.95rem;
			height: 0.95rem;
		}
	}

	@media (max-width: 768px) and (orientation: landscape) {
		.header {
			padding: 0.3rem 0.6rem;
		}

		.header h1 {
			font-size: 0.9rem;
		}
	}
</style>
