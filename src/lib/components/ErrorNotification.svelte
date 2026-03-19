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
	class="error-card"
	transition:fly={{ y: -20, duration: reducedMotion ? 0 : 300 }}
	role="alert"
>
	<h4>Loading Error</h4>
	<p>{message}</p>
	<div class="actions">
		<button class="btn-secondary" onclick={ondismiss}>Dismiss</button>
		<button class="btn-primary" onclick={onretry}>Retry</button>
	</div>
</div>

<style>
	.error-card {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 2000;
		max-width: 500px;
		width: 90vw;
		padding: 1.5rem 2rem;
		background: var(--glass-bg-heavy);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		border: 1px solid var(--glass-border);
		border-radius: 1rem;
		box-shadow: var(--glass-shadow);
	}

	h4 {
		color: #ef4444;
		font-weight: 600;
		font-size: 1.1rem;
		margin: 0 0 0.75rem;
	}

	p {
		color: var(--text-2);
		line-height: 1.6;
		margin: 0 0 1.25rem;
	}

	.actions {
		display: flex;
		flex-direction: column-reverse;
		gap: 0.5rem;
	}

	@media (min-width: 640px) {
		.actions {
			flex-direction: row;
			justify-content: flex-end;
			gap: 0.75rem;
		}
	}

	button {
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		font-weight: 500;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-secondary {
		background: var(--btn-sec-bg);
		border: 1px solid var(--btn-sec-border);
		color: var(--btn-sec-text);
	}

	.btn-secondary:hover {
		background: var(--btn-sec-hover);
		color: var(--text-1);
	}

	.btn-primary {
		background: #ef4444;
		border: none;
		color: white;
	}

	.btn-primary:hover {
		background: #dc2626;
	}
</style>
