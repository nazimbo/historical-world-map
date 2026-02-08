<script lang="ts">
	import { fly } from 'svelte/transition';

	interface Props {
		message: string;
		onretry: () => void;
		ondismiss: () => void;
	}

	let { message, onretry, ondismiss }: Props = $props();

	const reducedMotion =
		typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
</script>

<div
	class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-xl p-6 md:p-8 max-w-[500px] w-[90vw] z-[2000] shadow-xl"
	transition:fly={{ y: -20, duration: reducedMotion ? 0 : 300 }}
	role="alert"
>
	<h4 class="text-error-dark font-semibold text-lg mb-3">Loading Error</h4>
	<p class="text-gray-700 leading-relaxed mb-5">{message}</p>
	<div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
		<button
			class="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer text-sm"
			onclick={ondismiss}
		>
			Dismiss
		</button>
		<button
			class="px-4 py-2 border-none rounded-lg font-medium text-white bg-error hover:bg-error-dark transition-colors cursor-pointer text-sm"
			onclick={onretry}
		>
			Retry
		</button>
	</div>
</div>
