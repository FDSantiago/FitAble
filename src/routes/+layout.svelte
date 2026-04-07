<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	import { Toaster } from 'svelte-sonner';
	import { getFlash } from 'sveltekit-flash-message';
	import { page } from '$app/state'; // used to be $app/stores
	import { toast } from 'svelte-sonner';

	import LucideCircleX from '~icons/lucide/circle-x';

	let { children } = $props();

	const flash = getFlash(page);

	$effect(() => {
		if ($flash) {
			const type = $flash.type as 'success' | 'error' | 'info' | 'warning';

			if (toast[type]) {
				toast[type]($flash.message);
			} else {
				toast(`$flash.message`);
			}

			$flash = undefined;
		}
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<Toaster
	richColors
	theme="light"
	class="text-2xl"
	toastOptions={{
		unstyled: true,
		classes: {
			toast: 'flex items-center w-md p-4 rounded-lg drop-shadow-md',
			title: 'text-xl',
			icon: 'text-3xl mr-2'
		}
	}}
>
	{#snippet errorIcon()}
		<LucideCircleX class="size-6" />
	{/snippet}
</Toaster>
{@render children()}
