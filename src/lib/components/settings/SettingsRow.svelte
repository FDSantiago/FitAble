<script lang="ts">
	import type { SettingDefinition } from '$lib/config/settings';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import LucideVolume2 from '~icons/lucide/volume-2';
	import LucideShieldCheck from '~icons/lucide/shield-check';
	import LucideActivity from '~icons/lucide/activity';
	import LucideCamera from '~icons/lucide/camera';
	import LucideMoon from '~icons/lucide/moon';

	interface Props {
		setting: SettingDefinition;
		value: boolean | string;
		onchange: (value: boolean | string) => void;
	}

	let { setting, value, onchange }: Props = $props();

	const iconMap: Record<string, typeof LucideVolume2> = {
		Volume2: LucideVolume2,
		ShieldCheck: LucideShieldCheck,
		Activity: LucideActivity,
		Camera: LucideCamera,
		Moon: LucideMoon
	};

	let Icon = $derived(iconMap[setting.icon] ?? LucideActivity);

	let localValue = $state(value);
	let localBoolValue = $state(value as boolean);

	$effect(() => {
		localValue = value;
		localBoolValue = value as boolean;
	});

	function handleSwitchClick() {
		onchange(localBoolValue);
	}

	function handleSelectChange(option: string) {
		onchange(option);
	}
</script>

<div class="settings-row">
	<div class="icon-wrap">
		<Icon class="h-4 w-4" />
	</div>
	<span class="flex-1 text-sm font-semibold">{setting.label}</span>

	{#if setting.type === 'boolean'}
		<Switch bind:checked={localBoolValue} onclick={handleSwitchClick} />
	{:else if setting.type === 'select' && setting.options}
		<div class="flex gap-2">
			{#each setting.options as option}
				<button
					type="button"
					class="camera-chip {(value as string) === option
						? 'camera-chip-active'
						: 'camera-chip-inactive'}"
					onclick={() => handleSelectChange(option)}
				>
					{option}
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
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

	.icon-wrap {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		border-radius: 0.625rem;
		flex-shrink: 0;
		background-color: hsl(var(--muted) / 0.5);
	}

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
</style>
