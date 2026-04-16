<script lang="ts">
	import { page } from '$app/stores';
	import LucideHome from '~icons/lucide/home';
	import LucideUserRound from '~icons/lucide/user-round';
	import LucideCamera from '~icons/lucide/camera';
	import LucideBarChart2 from '~icons/lucide/bar-chart-2';
	import LucideSettings from '~icons/lucide/settings';
	import LucideTarget from '~icons/lucide/target';
	import { resolve } from '$app/paths';

	let { children } = $props();
</script>

<nav class="pb-safe fixed bottom-0 z-50 w-full border-t border-border bg-background">
	<div class="relative flex h-16 items-center justify-between px-4 sm:px-6">
		<a
			href={resolve('/dashboard')}
			class="flex flex-col items-center gap-1 {$page.url.pathname === resolve('/dashboard')
				? 'text-primary'
				: 'text-muted-foreground'}"
		>
			<LucideHome />
			<span class="font-bold">Dashboard</span>
		</a>

		<a
			href={resolve('/dashboard/goals')}
			class="flex flex-col items-center gap-1 {$page.url.pathname.startsWith(
				resolve('/dashboard/goals')
			)
				? 'text-primary'
				: 'text-muted-foreground'}"
		>
			<LucideTarget />
			<span class="font-bold">Goals</span>
		</a>

		<div class="relative flex w-12 justify-center sm:w-16">
			<a
				href={resolve('/workout')}
				class="absolute flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-4 shadow-primary/30 ring-background transition-transform hover:scale-105 active:scale-95 sm:h-16 sm:w-16"
				style="top:calc(var(--spacing) * -11);"
				aria-label="Start workout"
			>
				<LucideCamera />
			</a>
		</div>

		<a
			href={resolve('/dashboard/reports')}
			class="flex flex-col items-center gap-1 {$page.url.pathname.startsWith(
				resolve('/dashboard/reports')
			)
				? 'text-primary'
				: 'text-muted-foreground'}"
		>
			<LucideBarChart2 />
			<span class="font-bold">Reports</span>
		</a>

		<a
			href={resolve('/dashboard/profile')}
			class="flex flex-col items-center gap-1 {$page.url.pathname.startsWith(
				resolve('/dashboard/profile')
			)
				? 'text-primary'
				: 'text-muted-foreground'}"
		>
			<LucideUserRound />
			<span class="font-bold">Profile</span>
		</a>
	</div>
</nav>

{@render children()}
