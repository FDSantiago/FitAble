<script lang="ts">
	import { resolve } from '$app/paths';
	import { APP_NAME } from '$lib/config.js';
	import type { PageData } from './$types.js';
	import LoginForm from './login-form.svelte';
	let { data }: { data: PageData } = $props();

	import LucideActivity from '~icons/lucide/activity';
</script>

<div class="grid h-screen place-items-center">
	<div class="border-2 rounded-lg p-4 w-lg grid">
		<LucideActivity class="rounded-full bg-emerald-100 p-2 text-3xl text-emerald-400 place-self-center" />
		<p class="mt-4 text-center text-2xl font-bold">Login to {APP_NAME}</p>
		<p class="text-muted-foreground text-center">Smart Exercise Tracking & Form Correction</p>
		<LoginForm {data} />
		<p class="mt-4 place-self-center">
			New to {APP_NAME}? 
			<a href={resolve("/register")} class="text-primary text-bold hover:underline">Create a student account</a>
		</p>
	</div>
</div>
