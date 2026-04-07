<script>
	import LucideUserRound from '~icons/lucide/user-round';
	import LucidePlay from '~icons/lucide/play';
	import LucideCamera from '~icons/lucide/camera';
	import LucideActivity from '~icons/lucide/activity';
	import LucideHome from '~icons/lucide/home';
	import LucideBarChart2 from '~icons/lucide/bar-chart-2';
	import LucideSettings from '~icons/lucide/settings';

	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/index.js';

	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';

	let { data } = $props();
</script>

<div class="relative min-h-screen bg-background pb-24 text-foreground">
	<div class="px-4 py-6 sm:px-6 md:px-10 lg:px-16">
		<main class="mx-auto w-full max-w-7xl">
			<header class="mb-6 flex items-center justify-between pt-4 md:mb-8">
				<div class="mt-2 md:mt-4">
					<p class="text-xs font-medium text-muted-foreground sm:text-sm">Welcome back,</p>
					<h1 class="text-xl font-bold tracking-tight sm:text-2xl">{data.user.name}</h1>
				</div>
				<div
					class="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary text-primary sm:h-12 sm:w-12"
				>
					<LucideUserRound />
				</div>
			</header>

			<div
				class="relative mb-6 overflow-hidden rounded-2xl bg-primary p-4 text-primary-foreground shadow-md shadow-primary/20 sm:p-6 md:mb-8"
			>
				<div class="relative z-10 w-full">
					<h2 class="mb-1 text-lg font-bold sm:text-xl">Ready to train?</h2>
					<p class="mb-4 text-sm text-primary-foreground/90 sm:mb-6">
						Start your AI-assisted workout now.
					</p>
					<Button variant="secondary" class="font-semibold text-primary hover:bg-secondary/90">
						<LucidePlay fill="currentColor" class="mr-2" />
						Quick Start
					</Button>
				</div>
				<LucideCamera
					class="absolute text-6xl opacity-20 sm:text-7xl md:text-8xl"
					style="right:calc(var(--spacing) * -6); bottom: calc(var(--spacing) * -6)"
				/>
			</div>

			<section class="mb-6 md:mb-8">
				<h3 class="mb-3 text-base font-bold sm:mb-4 sm:text-lg">Weekly Overview</h3>
				<div class="grid grid-cols-2 gap-3 sm:gap-4">
					<Card.Root class="border-border shadow-sm">
						<Card.Header class="p-3 pb-2 sm:p-4">
							<Card.Title
								class="text-[10px] font-bold tracking-wider text-muted-foreground uppercase"
							>
								Workouts
							</Card.Title>
						</Card.Header>
						<Card.Content class="p-3 py-0 sm:p-4">
							<p class="text-2xl font-black sm:text-3xl">4</p>
						</Card.Content>
						<Card.Footer class="p-3 pt-1 sm:p-4">
							<p class="text-xs font-semibold text-primary">On track</p>
						</Card.Footer>
					</Card.Root>

					<Card.Root class="border-border shadow-sm">
						<Card.Header class="p-3 pb-2 sm:p-4">
							<Card.Title
								class="text-[10px] font-bold tracking-wider text-muted-foreground uppercase"
							>
								Avg Form Score
							</Card.Title>
						</Card.Header>
						<Card.Content class="p-3 py-0 sm:p-4">
							<p class="text-2xl font-black sm:text-3xl">88%</p>
						</Card.Content>
						<Card.Footer class="p-3 pt-1 sm:p-4">
							<p class="text-xs font-semibold text-primary">+2% from last week</p>
						</Card.Footer>
					</Card.Root>
				</div>
			</section>

			<section>
				<div class="mb-3 flex items-center justify-between sm:mb-4">
					<h3 class="text-base font-bold sm:text-lg">Recent Activity</h3>
					<a href={resolve('/')} class="text-sm font-semibold text-primary hover:underline"
						>View All</a
					>
				</div>

				<div class="flex flex-col gap-3">
					<Card.Root
						class="flex flex-col items-start justify-between border-border p-3 shadow-sm transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:p-4"
					>
						<div class="mb-2 flex items-center gap-3 sm:mb-0 sm:gap-4">
							<div
								class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:h-12 sm:w-12"
							>
								<LucideActivity />
							</div>
							<Card.Header class="space-y-0.5 p-0">
								<Card.Title class="text-sm font-bold sm:text-base">Lower Body (Squats)</Card.Title>
								<Card.Description class="text-xs">Today, 8:00 AM</Card.Description>
							</Card.Header>
						</div>
						<Card.Content class="p-0 text-left sm:text-right">
							<p class="text-lg font-black text-primary">92%</p>
							<p class="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
								Form
							</p>
						</Card.Content>
					</Card.Root>

					<Card.Root
						class="flex flex-col items-start justify-between border-border p-3 shadow-sm transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:p-4"
					>
						<div class="mb-2 flex items-center gap-3 sm:mb-0 sm:gap-4">
							<div
								class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:h-12 sm:w-12"
							>
								<LucideActivity />
							</div>
							<Card.Header class="space-y-0.5 p-0">
								<Card.Title class="text-sm font-bold sm:text-base">Upper Body (Pushups)</Card.Title>
								<Card.Description class="text-xs">Yesterday</Card.Description>
							</Card.Header>
						</div>
						<Card.Content class="p-0 text-left sm:text-right">
							<p class="text-lg font-black text-primary">85%</p>
							<p class="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
								Form
							</p>
						</Card.Content>
					</Card.Root>
				</div>
			</section>
		</main>
	</div>
</div>

<style>
	.pb-safe {
		padding-bottom: env(safe-area-inset-bottom);
	}
</style>
