<script lang="ts">
	import { fly, fade } from 'svelte/transition';

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
		if (e.key === 'Escape' && territory) {
			onclose();
		}
	}

	let entries = $derived(territory ? getDisplayEntries(territory) : []);

	$effect(() => {
		if (territory && panelElement) {
			panelElement.focus({ preventScroll: true });
		}
	});
</script>

<svelte:window onkeydown={handleKeydown} />

{#if territory}
	<div
		class="info-panel"
		bind:this={panelElement}
		transition:fly={{ x: 340, duration: reducedMotion ? 0 : 350, opacity: 0.5 }}
		tabindex="-1"
		role="region"
		aria-label="Territory information"
	>
		<!-- Accent bar -->
		<div class="accent-bar" aria-hidden="true"></div>

		<!-- Header -->
		<div class="panel-header">
			<div class="header-content">
				<h3 class="territory-name">{getTerritoryName(territory)}</h3>
				<span class="period-badge">
					<svg class="badge-icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
						<path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm0 14.5a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13zM8.5 4h-1.2v4.4l3.7 2.2.6-1-3.1-1.8V4z"/>
					</svg>
					{periodLabel}
				</span>
			</div>
			<button
				class="close-btn"
				onclick={onclose}
				aria-label="Close territory information panel"
			>
				<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
					<path d="M4 4l8 8M12 4l-8 8"/>
				</svg>
			</button>
		</div>

		<!-- Properties -->
		{#if entries.length > 0}
			<div class="panel-body">
				<dl class="properties">
					{#each entries as entry, i (entry.key)}
						{#if i > 0}
							<div class="separator" aria-hidden="true"></div>
						{/if}
						<div class="property" in:fade={{ delay: reducedMotion ? 0 : 40 * i, duration: reducedMotion ? 0 : 200 }}>
							<dt>{entry.key}</dt>
							<dd>{entry.value}</dd>
						</div>
					{/each}
				</dl>
			</div>
		{:else}
			<div class="panel-body">
				<p class="empty-state">No additional details available for this territory.</p>
			</div>
		{/if}
	</div>
{/if}

<style>
	.info-panel {
		position: absolute;
		top: 1.25rem;
		right: 1.25rem;
		width: 320px;
		max-height: 440px;
		display: flex;
		flex-direction: column;
		background: rgba(255, 255, 255, 0.92);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		border: 1px solid rgba(229, 231, 235, 0.8);
		border-radius: 16px;
		box-shadow:
			0 4px 6px -1px rgba(0, 0, 0, 0.05),
			0 10px 22px -4px rgba(0, 0, 0, 0.08),
			0 0 0 1px rgba(0, 0, 0, 0.02);
		z-index: 1000;
		overflow: hidden;
		user-select: text;
	}

	.info-panel:focus {
		outline: none;
	}

	/* Accent gradient bar */
	.accent-bar {
		height: 3px;
		background: linear-gradient(90deg, #f39c12, #e67e22, #f39c12);
		flex-shrink: 0;
	}

	/* Header */
	.panel-header {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		padding: 1rem 1.25rem 0.875rem;
		flex-shrink: 0;
	}

	.header-content {
		flex: 1;
		min-width: 0;
	}

	.territory-name {
		margin: 0;
		font-size: 1.05rem;
		font-weight: 700;
		line-height: 1.3;
		color: var(--color-gray-900);
		letter-spacing: -0.01em;
	}

	.period-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		margin-top: 0.4rem;
		padding: 0.2rem 0.55rem;
		font-size: 0.7rem;
		font-weight: 600;
		color: #92400e;
		background: #fef3c7;
		border: 1px solid #fde68a;
		border-radius: 100px;
		letter-spacing: 0.02em;
		white-space: nowrap;
	}

	.badge-icon {
		width: 0.7rem;
		height: 0.7rem;
		flex-shrink: 0;
		opacity: 0.7;
	}

	.close-btn {
		flex-shrink: 0;
		width: 1.75rem;
		height: 1.75rem;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		margin-top: 0.1rem;
		border: none;
		border-radius: 8px;
		background: transparent;
		color: var(--color-gray-400);
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.close-btn:hover {
		background: var(--color-gray-100);
		color: var(--color-gray-700);
	}

	.close-btn:active {
		transform: scale(0.92);
	}

	.close-btn svg {
		width: 0.85rem;
		height: 0.85rem;
	}

	/* Body / scrollable area */
	.panel-body {
		padding: 0 1.25rem 1rem;
		overflow-y: auto;
		flex: 1;
		min-height: 0;
	}

	/* Custom scrollbar */
	.panel-body::-webkit-scrollbar {
		width: 5px;
	}

	.panel-body::-webkit-scrollbar-track {
		background: transparent;
	}

	.panel-body::-webkit-scrollbar-thumb {
		background: var(--color-gray-200);
		border-radius: 100px;
	}

	.panel-body::-webkit-scrollbar-thumb:hover {
		background: var(--color-gray-300);
	}

	/* Properties */
	.properties {
		margin: 0;
		padding: 0;
	}

	.separator {
		height: 1px;
		background: var(--color-gray-100);
		margin: 0.125rem 0;
	}

	.property {
		padding: 0.5rem 0;
	}

	.property dt {
		font-size: 0.65rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-gray-400);
		margin-bottom: 0.15rem;
		line-height: 1;
	}

	.property dd {
		margin: 0;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-gray-800);
		line-height: 1.4;
		word-break: break-word;
	}

	.empty-state {
		margin: 0.5rem 0 0;
		font-size: 0.8rem;
		color: var(--color-gray-400);
		font-style: italic;
	}

	/* ── Responsive ── */

	@media (max-width: 768px) {
		.info-panel {
			width: auto;
			max-width: none;
			left: max(env(safe-area-inset-left), 10px);
			right: max(env(safe-area-inset-right), 10px);
			top: calc(max(env(safe-area-inset-top), 10px) + 80px);
			max-height: calc(100vh - 220px);
		}
	}

	@media (max-width: 768px) and (orientation: landscape) {
		.info-panel {
			max-height: calc(100vh - 120px);
			width: 300px;
			left: auto;
			right: env(safe-area-inset-right, 10px);
			top: calc(env(safe-area-inset-top, 10px) + 50px);
		}
	}

	@media (max-width: 480px) {
		.info-panel {
			top: calc(max(env(safe-area-inset-top), 8px) + 70px);
			left: max(env(safe-area-inset-left), 8px);
			right: max(env(safe-area-inset-right), 8px);
			max-height: calc(100vh - 190px);
			border-radius: 14px;
		}

		.panel-header {
			padding: 0.875rem 1rem 0.75rem;
		}

		.panel-body {
			padding: 0 1rem 0.875rem;
		}

		.territory-name {
			font-size: 0.95rem;
		}
	}
</style>
