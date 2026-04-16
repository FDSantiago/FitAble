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
		onchange(!localBoolValue);
	}

	function handleSelectChange(option: string) {
		onchange(option);
	}
</script>

<div
	class="flex cursor-pointer items-center gap-3 p-4 transition-colors duration-150 hover:bg-muted/50"
>
	<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted/50">
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
					class="cursor-pointer rounded-full border border-transparent px-3 py-1 text-xs font-semibold transition-colors duration-150 {(value as string) ===
					option
						? 'border-primary/40 bg-primary/10 text-primary'
						: 'border-border bg-transparent text-muted-foreground hover:border-primary/30 hover:text-primary/80'}"
					onclick={() => handleSelectChange(option)}
				>
					{option}
				</button>
			{/each}
		</div>
	{/if}
</div>
