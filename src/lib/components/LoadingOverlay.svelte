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
		class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-200 p-6 md:p-10 rounded-xl text-center shadow-lg z-[1000]"
		role="status"
		aria-live="polite"
		transition:fade={{ duration: reducedMotion ? 0 : 200 }}
	>
		<div class="spinner"></div>
		<p class="text-gray-700 font-medium">Loading historical data...</p>
	</div>
{/if}

<style>
	.spinner {
		position: relative;
		width: 50px;
		height: 50px;
		margin: 0 auto 1rem;
	}

	.spinner::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		border: 3px solid var(--color-gray-200);
		border-top: 3px solid var(--color-primary);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
