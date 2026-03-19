<script lang="ts">
	import { fade } from 'svelte/transition';

	interface Props {
		isLoading: boolean;
	}

	let { isLoading }: Props = $props();

	const reducedMotion =
		typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
</script>

{#if isLoading}
	<div
		class="loading-card"
		role="status"
		aria-live="polite"
		transition:fade={{ duration: reducedMotion ? 0 : 200 }}
	>
		<div class="spinner"></div>
		<p>Loading historical data...</p>
	</div>
{/if}

<style>
	.loading-card {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 1000;
		padding: 2rem 2.5rem;
		background: var(--glass-bg-heavy);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		border: 1px solid var(--glass-border);
		border-radius: 1rem;
		text-align: center;
		box-shadow: var(--glass-shadow);
	}

	.loading-card p {
		color: var(--text-2);
		font-weight: 500;
		margin: 0;
	}

	.spinner {
		position: relative;
		width: 44px;
		height: 44px;
		margin: 0 auto 1rem;
	}

	.spinner::after {
		content: '';
		position: absolute;
		inset: 0;
		border: 3px solid var(--separator);
		border-top-color: var(--accent);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
