<script lang="ts">
	import { enhance } from '$app/forms';
	import SettingsRow from '$lib/components/settings/SettingsRow.svelte';
	import { setMode } from 'mode-watcher';

	let { data } = $props();

	const grouped = $derived(Object.groupBy(data.config, (s) => s.category));

	let localSettings = $state({ ...data.settings });

	function handleSettingChange(key: string, value: boolean | string) {
		localSettings[key] = value;

		if (key === 'darkmode') {
			setMode(value ? 'dark' : 'light');
		}

		submitForm(key, value);
	}

	function submitForm(key: string, value: boolean | string) {
		setTimeout(() => {
			const form = document.getElementById('settings-form') as HTMLFormElement;
			if (form) {
				const input = form.querySelector(`input[name="${key}"]`) as HTMLInputElement;
				if (input) {
					input.value = String(value);
				}
				form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
			}
		}, 0);
	}
</script>

<div class="relative min-h-screen bg-background pb-28 text-foreground">
	<div class="px-4 py-6 sm:px-6 md:px-10 lg:px-16">
		<main class="mx-auto w-full max-w-2xl">
			<header class="mb-6 pt-4">
				<h1 class="text-xl font-bold tracking-tight sm:text-2xl">App Settings</h1>
			</header>

			<form id="settings-form" method="POST" action="?/updateSettings" use:enhance class="hidden">
				{#each data.config as setting (setting.key)}
					<input
						type="hidden"
						name={setting.key}
						value={String(localSettings[setting.key] ?? setting.default)}
					/>
				{/each}
			</form>

			{#each Object.entries(grouped) as [category, settings] (category)}
				<section class="mb-6">
					<p class="mb-3 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
						{category}
					</p>

					<div class="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
						{#each settings ?? [] as setting, i (setting.key)}
							{#if i > 0}
								<div class="mx-4 h-px bg-border" />
							{/if}
							<SettingsRow
								{setting}
								value={localSettings[setting.key]}
								onchange={(val) => handleSettingChange(setting.key, val)}
							/>
						{/each}
					</div>
				</section>
			{/each}
		</main>
	</div>
</div>
