<script lang="ts">
	import { APP_NAME } from '$lib/config.js';
	import type { PageData } from './$types.js';
	import RegistrationForm from './registration-form.svelte';
	let { data }: { data: PageData } = $props();
</script>

<div class="grid h-screen place-items-center">
	<div class="border-2 rounded-lg p-4 w-lg grid">
		<p class="mt-4 text-center text-2xl font-bold">Student Registration</p>
		<p class="text-muted-foreground text-center">Join {APP_NAME} to track your progress.</p>
		<RegistrationForm {data} />
	</div>
</div>
