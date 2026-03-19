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
			clearTimeout(debounceTimer);
			debounceTimer = setTimeout(() => {
				onperiodchange(periodIndex);
			}, 300);
		} else if (e.key === 'ArrowRight' && periodIndex < periods.length - 1) {
			e.preventDefault();
			periodIndex = periodIndex + 1;
			clearTimeout(debounceTimer);
			debounceTimer = setTimeout(() => {
				onperiodchange(periodIndex);
			}, 300);
		}
	}
</script>

<div class="time-controls">
	<div class="slider-inner">
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
		<div class="current-label">
			{periods[periodIndex]?.label ?? ''}
		</div>
		<p class="attribution">
			Data source: <a
				href="https://github.com/aourednik/historical-basemaps"
				target="_blank"
				rel="noopener noreferrer">Historical Basemaps</a>
		</p>
	</div>
</div>

<style>
	.time-controls {
		position: absolute;
		bottom: 1.25rem;
		left: 50%;
		transform: translateX(-50%);
		z-index: 1000;
		min-width: 500px;
		max-width: 800px;
		width: 70vw;
		padding: 1.25rem 1.5rem;
		background: var(--glass-bg);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		border: 1px solid var(--glass-border);
		border-radius: 1rem;
		box-shadow: var(--glass-shadow);
	}

	.slider-inner {
		max-width: 800px;
		margin: 0 auto;
	}

	input[type='range'] {
		width: 100%;
		height: 5px;
		border-radius: 10px;
		background: linear-gradient(
			to right,
			var(--track-start) 0%,
			var(--track-mid) 50%,
			var(--track-end) 100%
		);
		outline: none;
		margin-bottom: 1.25rem;
		cursor: pointer;
		appearance: none;
		-webkit-appearance: none;
		-moz-appearance: none;
	}

	input[type='range']:focus-visible {
		outline: 3px solid var(--accent);
		outline-offset: 3px;
	}

	input[type='range']::-webkit-slider-thumb {
		appearance: none;
		width: 22px;
		height: 22px;
		border-radius: 50%;
		background: var(--accent);
		cursor: pointer;
		box-shadow:
			0 0 14px var(--thumb-shadow),
			0 2px 6px rgba(0, 0, 0, 0.2);
		transition: all 0.2s ease;
		border: 2px solid var(--thumb-border);
	}

	input[type='range']::-webkit-slider-thumb:hover {
		transform: scale(1.15);
		box-shadow:
			0 0 20px var(--accent-glow),
			0 4px 10px rgba(0, 0, 0, 0.2);
	}

	input[type='range']::-moz-range-thumb {
		width: 22px;
		height: 22px;
		border-radius: 50%;
		background: var(--accent);
		cursor: pointer;
		border: 2px solid var(--thumb-border);
		box-shadow:
			0 0 14px var(--thumb-shadow),
			0 2px 6px rgba(0, 0, 0, 0.2);
	}

	.slider-labels {
		position: relative;
		display: flex;
		font-size: 0.7rem;
		color: var(--text-3);
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

	.slider-labels span:first-child {
		transform: translateX(0);
	}

	.slider-labels span:last-child {
		transform: translateX(-100%);
	}

	.current-label {
		text-align: center;
		font-size: 1rem;
		font-weight: 600;
		color: var(--text-1);
		margin-top: 0.5rem;
		letter-spacing: 0.03em;
	}

	.attribution {
		display: none;
		text-align: center;
		font-size: 0.6rem;
		color: var(--text-3);
		margin-top: 0.75rem;
		line-height: 1.4;
	}

	.attribution a {
		font-weight: 600;
		color: var(--text-2);
		text-decoration: none;
		transition: color 0.2s;
	}

	.attribution a:hover {
		color: var(--accent);
		text-decoration: underline;
	}

	@media (min-width: 769px) {
		.attribution {
			display: block;
		}
	}

	@media (max-width: 768px) {
		.time-controls {
			bottom: calc(env(safe-area-inset-bottom, 0px) + 20px);
			left: max(env(safe-area-inset-left), 10px);
			right: max(env(safe-area-inset-right), 10px);
			transform: none;
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
			width: 30px;
			height: 30px;
			border-width: 3px;
		}

		input[type='range']::-moz-range-thumb {
			width: 30px;
			height: 30px;
			border-width: 3px;
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
			bottom: calc(env(safe-area-inset-bottom, 0px) + 16px);
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
