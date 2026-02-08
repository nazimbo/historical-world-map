<script lang="ts">
	import { fly } from 'svelte/transition';

	interface Props {
		territory: Record<string, unknown> | null;
		periodLabel: string;
		onclose: () => void;
	}

	let { territory, periodLabel, onclose }: Props = $props();

	let panelElement: HTMLDivElement | undefined = $state();

	const reducedMotion =
		typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	const SKIP_KEYS = new Set(['NAME', 'name', 'NAME_EN']);

	function getTerritoryName(props: Record<string, unknown>): string {
		return String(props.NAME ?? props.name ?? props.NAME_EN ?? 'Unknown Territory');
	}

	function getDisplayEntries(props: Record<string, unknown>): Array<{ key: string; value: string }> {
		const entries: Array<{ key: string; value: string }> = [];
		for (const [key, value] of Object.entries(props)) {
			if (!SKIP_KEYS.has(key) && value != null && String(value).trim() !== '') {
				const displayKey = key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
				entries.push({ key: displayKey, value: String(value) });
			}
		}
		return entries;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			onclose();
		}
	}

	$effect(() => {
		if (territory && panelElement) {
			panelElement.focus();
		}
	});
</script>

<svelte:window onkeydown={handleKeydown} />

{#if territory}
	<div
		class="info-panel absolute top-5 right-5 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-[1000] max-h-[400px] overflow-y-auto select-text"
		bind:this={panelElement}
		transition:fly={{ x: 320, duration: reducedMotion ? 0 : 300 }}
		tabindex="-1"
		role="region"
		aria-label="Territory information"
	>
		<div class="flex justify-between items-center px-5 py-4 bg-gray-50 border-b border-gray-200 rounded-t-xl">
			<h3 class="text-gray-900 text-lg font-semibold m-0">{getTerritoryName(territory)}</h3>
			<button
				class="bg-transparent border-none text-gray-500 text-2xl cursor-pointer p-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 hover:text-gray-900 transition-colors"
				onclick={onclose}
				aria-label="Close territory information panel"
			>
				&times;
			</button>
		</div>
		<div class="px-5 py-4 text-gray-700 leading-relaxed">
			<div class="mb-1">
				<strong class="text-gray-900 mr-1">Territory:</strong>
				<span>{getTerritoryName(territory)}</span>
			</div>
			{#each getDisplayEntries(territory) as entry (entry.key)}
				<div class="mb-1">
					<strong class="text-gray-900 mr-1">{entry.key}:</strong>
					<span>{entry.value}</span>
				</div>
			{/each}
			<div class="mb-1">
				<strong class="text-gray-900 mr-1">Period:</strong>
				<span>{periodLabel}</span>
			</div>
		</div>
	</div>
{/if}

<style>
	@media (max-width: 768px) and (orientation: landscape) {
		.info-panel {
			max-height: calc(100vh - 120px);
			width: 300px;
			left: auto;
			right: env(safe-area-inset-right, 10px);
			top: calc(env(safe-area-inset-top, 10px) + 50px);
		}
	}

	@media (max-width: 768px) {
		.info-panel {
			width: calc(100% - 20px);
			max-width: none;
			left: max(env(safe-area-inset-left), 10px);
			right: max(env(safe-area-inset-right), 10px);
			top: calc(max(env(safe-area-inset-top), 10px) + 80px);
			max-height: calc(100vh - 220px);
		}
	}

	@media (max-width: 480px) {
		.info-panel {
			top: calc(max(env(safe-area-inset-top), 8px) + 70px);
			left: max(env(safe-area-inset-left), 8px);
			right: max(env(safe-area-inset-right), 8px);
			max-height: calc(100vh - 190px);
		}
	}
</style>
