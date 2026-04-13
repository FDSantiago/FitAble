<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import LucideVolume2 from '~icons/lucide/volume-2';
	import LucideShieldCheck from '~icons/lucide/shield-check';
	import LucideActivity from '~icons/lucide/activity';
	import LucideCamera from '~icons/lucide/camera';

	let { data, form } = $props();

	// Local reactive copies so toggles feel instant
	let realTimeVoiceAlerts = $state(data.settings.realTimeVoiceAlerts);
	let realTimeFormCorrection = $state(data.settings.realTimeFormCorrection);
	let gestureAutoCounting = $state(data.settings.gestureAutoCounting);
	let defaultCamera = $state(data.settings.defaultCamera);

	const cameraOptions = ['Front Camera', 'Back Camera'] as const;

	// Submits the full settings form whenever any value changes
	function submitForm() {
		// Delay a tick so the reactive state has updated before the hidden form is submitted
		setTimeout(() => {
			document.getElementById('settings-form')?.dispatchEvent(
				new Event('submit', { bubbles: true, cancelable: true })
			);
		}, 0);
	}
</script>

<div class="relative min-h-screen bg-background pb-28 text-foreground">
	<div class="px-4 py-6 sm:px-6 md:px-10 lg:px-16">
		<main class="mx-auto w-full max-w-2xl">
			<!-- Header -->
			<header class="mb-6 pt-4">
				<h1 class="text-xl font-bold tracking-tight sm:text-2xl">App Settings</h1>
			</header>

			<!-- Hidden form that auto-submits on any change -->
			<form
				id="settings-form"
				method="POST"
				action="?/updateSettings"
				use:enhance
				class="hidden"
			>
				<input type="hidden" name="realTimeVoiceAlerts" value={String(realTimeVoiceAlerts)} />
				<input type="hidden" name="realTimeFormCorrection" value={String(realTimeFormCorrection)} />
				<input type="hidden" name="gestureAutoCounting" value={String(gestureAutoCounting)} />
				<input type="hidden" name="defaultCamera" value={defaultCamera} />
			</form>

			<!-- Virtual Coach Settings -->
			<section class="mb-6">
				<p class="mb-3 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
					Virtual Coach Settings
				</p>

				<div class="flex flex-col gap-0 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
					<!-- Real-Time Voice Alerts -->
					<label class="settings-row group">
						<div class="icon-wrap bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
							<LucideVolume2 class="h-4 w-4" />
						</div>
						<span class="flex-1 text-sm font-semibold">Real-Time Voice Alerts</span>
						<button
							type="button"
							role="switch"
							aria-checked={realTimeVoiceAlerts}
							class="toggle {realTimeVoiceAlerts ? 'toggle-on' : 'toggle-off'}"
							onclick={() => {
								realTimeVoiceAlerts = !realTimeVoiceAlerts;
								submitForm();
							}}
						>
							<span class="toggle-thumb" />
						</button>
					</label>

					<div class="mx-4 h-px bg-border" />

					<!-- Real-Time Form Correction -->
					<label class="settings-row group">
						<div class="icon-wrap bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
							<LucideShieldCheck class="h-4 w-4" />
						</div>
						<span class="flex-1 text-sm font-semibold">Real-Time Form Correction</span>
						<button
							type="button"
							role="switch"
							aria-checked={realTimeFormCorrection}
							class="toggle {realTimeFormCorrection ? 'toggle-on' : 'toggle-off'}"
							onclick={() => {
								realTimeFormCorrection = !realTimeFormCorrection;
								submitForm();
							}}
						>
							<span class="toggle-thumb" />
						</button>
					</label>

					<div class="mx-4 h-px bg-border" />

					<!-- Gesture Auto-Counting -->
					<label class="settings-row group">
						<div class="icon-wrap bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
							<LucideActivity class="h-4 w-4" />
						</div>
						<span class="flex-1 text-sm font-semibold">Gesture Auto-Counting</span>
						<button
							type="button"
							role="switch"
							aria-checked={gestureAutoCounting}
							class="toggle {gestureAutoCounting ? 'toggle-on' : 'toggle-off'}"
							onclick={() => {
								gestureAutoCounting = !gestureAutoCounting;
								submitForm();
							}}
						>
							<span class="toggle-thumb" />
						</button>
					</label>
				</div>
			</section>

			<!-- Hardware & Camera -->
			<section>
				<p class="mb-3 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
					Hardware &amp; Camera
				</p>

				<div class="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
					<div class="settings-row items-start sm:items-center">
						<div class="icon-wrap bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
							<LucideCamera class="h-4 w-4" />
						</div>
						<div class="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
							<span class="text-sm font-semibold">Default Camera</span>
							<div class="flex gap-2">
								{#each cameraOptions as option (option.length)}
									<button
										type="button"
										class="camera-chip {defaultCamera === option ? 'camera-chip-active' : 'camera-chip-inactive'}"
										onclick={() => {
											defaultCamera = option;
											submitForm();
										}}
									>
										{option}
									</button>
								{/each}
							</div>
						</div>
					</div>
				</div>
			</section>
		</main>
	</div>
</div>

<style>
	/* ── Row ────────────────────────────────────────────────────────────────── */
	.settings-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem;
		cursor: pointer;
		transition: background-color 0.15s;
	}
	.settings-row:hover {
		background-color: hsl(var(--muted) / 0.5);
	}

	/* ── Icon wrapper ───────────────────────────────────────────────────────── */
	.icon-wrap {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		border-radius: 0.625rem;
		flex-shrink: 0;
	}

	/* ── Toggle switch ──────────────────────────────────────────────────────── */
	.toggle {
		position: relative;
		width: 2.75rem;
		height: 1.625rem;
		border-radius: 9999px;
		border: none;
		cursor: pointer;
		flex-shrink: 0;
		transition: background-color 0.2s ease;
		outline: none;
	}
	.toggle:focus-visible {
		box-shadow: 0 0 0 3px hsl(var(--primary) / 0.4);
	}
	.toggle-on {
		background-color: hsl(var(--primary));
	}
	.toggle-off {
		background-color: hsl(var(--muted-foreground) / 0.3);
	}
	.toggle-thumb {
		position: absolute;
		top: 0.1875rem;
		left: 0.1875rem;
		width: 1.25rem;
		height: 1.25rem;
		border-radius: 9999px;
		background-color: white;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
		transition: transform 0.2s ease;
	}
	.toggle-on .toggle-thumb {
		transform: translateX(1.125rem);
	}

	/* ── Camera chip ────────────────────────────────────────────────────────── */
	.camera-chip {
		padding: 0.25rem 0.75rem;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 600;
		border: 1.5px solid transparent;
		cursor: pointer;
		transition:
			background-color 0.15s,
			color 0.15s,
			border-color 0.15s;
	}
	.camera-chip-active {
		color: hsl(var(--primary));
		border-color: hsl(var(--primary) / 0.4);
		background-color: hsl(var(--primary) / 0.08);
	}
	.camera-chip-inactive {
		color: hsl(var(--muted-foreground));
		border-color: hsl(var(--border));
		background-color: transparent;
	}
	.camera-chip-inactive:hover {
		border-color: hsl(var(--primary) / 0.3);
		color: hsl(var(--primary) / 0.8);
	}

	/* ── Save toast ─────────────────────────────────────────────────────────── */
	.save-toast {
		position: fixed;
		bottom: 6rem;
		left: 50%;
		transform: translateX(-50%);
		background-color: hsl(var(--primary));
		color: hsl(var(--primary-foreground));
		padding: 0.5rem 1.25rem;
		border-radius: 9999px;
		font-size: 0.8125rem;
		font-weight: 600;
		box-shadow: 0 4px 16px hsl(var(--primary) / 0.35);
		animation: toast-in-out 2s ease forwards;
		pointer-events: none;
	}

	@keyframes toast-in-out {
		0% {
			opacity: 0;
			transform: translateX(-50%) translateY(8px);
		}
		15% {
			opacity: 1;
			transform: translateX(-50%) translateY(0);
		}
		75% {
			opacity: 1;
		}
		100% {
			opacity: 0;
			transform: translateX(-50%) translateY(-4px);
		}
	}
</style>
