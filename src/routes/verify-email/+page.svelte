<script lang="ts">
	import LucideMailQuestionMark from '~icons/lucide/mail-question-mark';
	import LucideMailWarning from '~icons/lucide/mail-warning';
	import LucideMailCheck from '~icons/lucide/mail-check';
	import { resolve } from '$app/paths';

	let { data } = $props();

	const iconMap: Record<string, any> = {
		TOKEN_MISSING: LucideMailQuestionMark,
		TOKEN_INVALID_OR_EXPIRED: LucideMailWarning
	};

	const iconClasses: Record<string, string> = {
		TOKEN_MISSING: 'bg-amber-100 text-amber-400 ',
		TOKEN_INVALID_OR_EXPIRED: 'bg-red-100 text-red-400'
	};

	const Icon = iconMap[data.code as keyof typeof iconMap] || LucideMailQuestionMark;
</script>

<div class="grid h-screen place-items-center p-4">
	<div>
		{#if data.success}
            <div class="rounded-full place-self-center text-5xl p-4 bg-emerald-100 text-emerald-400">
                <LucideMailCheck />
			</div>
			<p class="mt-4 text-center text-4xl font-bold">Email verified</p>
			<p class="text-center text-2xl text-muted-foreground">
				Your email has been verified, you may now continue <a href={resolve("/login")} class="text-primary text-bold hover:underline">logging in</a>.
			</p>
		{:else if !data.success && data.code}
			<div class={`rounded-full place-self-center text-5xl p-4 ${iconClasses[data.code]}`}>
				<Icon />
			</div>
			<p class="mt-4 text-center text-4xl font-bold">Verification failed</p>
			<p class="text-center text-2xl text-muted-foreground">{data.message}</p>
		{:else}
			<p>Unknown error</p>
		{/if}
	</div>
</div>
