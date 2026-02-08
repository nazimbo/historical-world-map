<script lang="ts">
	import type { Period } from '$lib/periodsConfig.js';

	interface Props {
		periods: Period[];
		periodIndex: number;
		onperiodchange: (index: number) => void;
	}

	let { periods, periodIndex = $bindable(), onperiodchange }: Props = $props();

	let debounceTimer: ReturnType<typeof setTimeout> | undefined;

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		const newIndex = parseInt(target.value, 10);
		periodIndex = newIndex;

		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			onperiodchange(newIndex);
		}, 300);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowLeft' && periodIndex > 0) {
			e.preventDefault();
			periodIndex = periodIndex - 1;
			onperiodchange(periodIndex);
		} else if (e.key === 'ArrowRight' && periodIndex < periods.length - 1) {
			e.preventDefault();
			periodIndex = periodIndex + 1;
			onperiodchange(periodIndex);
		}
	}
</script>

<div class="time-controls absolute bottom-5 left-1/2 -translate-x-1/2 bg-white border border-gray-200 px-5 py-4 rounded-2xl z-[1000] min-w-[500px] max-w-[800px] w-[70vw] shadow-lg">
	<div class="max-w-[800px] mx-auto">
		<label for="time-slider" class="sr-only">Historical time period</label>
		<input
			type="range"
			id="time-slider"
			min="0"
			max={periods.length - 1}
			value={periodIndex}
			step="1"
			aria-valuetext={periods[periodIndex]?.label ?? ''}
			oninput={handleInput}
			onkeydown={handleKeydown}
		/>
		<div class="slider-labels">
			<span>123000 BC</span>
			<span>1000 BC</span>
			<span>1 BC</span>
			<span>1000 AD</span>
			<span>1492 AD</span>
			<span>2010 AD</span>
		</div>
		<div class="text-center text-base font-semibold text-gray-900 mt-2 tracking-wide">
			{periods[periodIndex]?.label ?? ''}
		</div>
	</div>
</div>

<style>
	input[type='range'] {
		width: 100%;
		height: 6px;
		border-radius: 10px;
		background: linear-gradient(
			to right,
			var(--color-gray-200) 0%,
			var(--color-primary-light) 50%,
			var(--color-primary) 100%
		);
		outline: none;
		margin-bottom: 1.5rem;
		cursor: pointer;
		appearance: none;
		-webkit-appearance: none;
		-moz-appearance: none;
	}

	input[type='range']:focus-visible {
		outline: 3px solid var(--color-primary);
		outline-offset: 3px;
	}

	input[type='range']::-webkit-slider-thumb {
		appearance: none;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: var(--color-primary);
		cursor: pointer;
		box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3);
		transition: all 0.2s ease;
		border: 3px solid white;
	}

	input[type='range']::-webkit-slider-thumb:hover {
		transform: scale(1.1);
		box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
	}

	input[type='range']::-moz-range-thumb {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: var(--color-primary);
		cursor: pointer;
		border: 3px solid white;
		box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3);
	}

	.slider-labels {
		position: relative;
		display: flex;
		font-size: 0.7rem;
		color: var(--color-gray-500);
		margin-top: 0.75rem;
		margin-bottom: 0.75rem;
		height: 1rem;
	}

	.slider-labels span {
		position: absolute;
		font-weight: 500;
		transform: translateX(-50%);
		white-space: nowrap;
		padding: 0.25rem 0;
	}

	.slider-labels span:nth-child(1) {
		left: 0%;
	}
	.slider-labels span:nth-child(2) {
		left: 15.69%;
	}
	.slider-labels span:nth-child(3) {
		left: 31.37%;
	}
	.slider-labels span:nth-child(4) {
		left: 50.98%;
	}
	.slider-labels span:nth-child(5) {
		left: 62.75%;
	}
	.slider-labels span:nth-child(6) {
		left: 100%;
	}

	@media (max-width: 768px) {
		.time-controls {
			bottom: max(env(safe-area-inset-bottom), 10px);
			left: max(env(safe-area-inset-left), 10px);
			right: max(env(safe-area-inset-right), 10px);
			translate: none;
			min-width: auto;
			max-width: none;
			width: auto;
			padding: 1.2rem;
		}

		input[type='range'] {
			height: 8px;
			margin-bottom: 1rem;
		}

		input[type='range']::-webkit-slider-thumb {
			width: 32px;
			height: 32px;
			border: 4px solid white;
		}

		input[type='range']::-moz-range-thumb {
			width: 32px;
			height: 32px;
			border: 4px solid white;
		}

		.slider-labels {
			font-size: 0.6rem;
			margin-top: 0.3rem;
			margin-bottom: 0.3rem;
		}

		.slider-labels span {
			display: none;
		}

		.slider-labels span:first-child,
		.slider-labels span:nth-child(3),
		.slider-labels span:last-child {
			display: inline;
		}
	}

	@media (max-width: 480px) {
		.time-controls {
			bottom: max(env(safe-area-inset-bottom), 8px);
			left: max(env(safe-area-inset-left), 8px);
			right: max(env(safe-area-inset-right), 8px);
			padding: 1rem;
			border-radius: 18px;
		}

		input[type='range'] {
			height: 10px;
			margin-bottom: 0.8rem;
		}

		input[type='range']::-webkit-slider-thumb {
			width: 32px;
			height: 32px;
		}

		input[type='range']::-moz-range-thumb {
			width: 32px;
			height: 32px;
		}

		.slider-labels {
			font-size: 0.55rem;
			margin-top: 0.2rem;
			margin-bottom: 0.2rem;
		}

		.slider-labels span {
			display: none;
		}

		.slider-labels span:first-child,
		.slider-labels span:last-child {
			display: inline;
		}
	}

	@media (max-width: 768px) and (orientation: landscape) {
		.time-controls {
			padding: 0.6rem 0.8rem;
			border-radius: 12px;
		}
	}
</style>
