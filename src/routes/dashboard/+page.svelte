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
</script>

<div
	class="relative min-h-screen bg-background pb-24 text-foreground sm:mx-auto sm:max-w-md sm:border-x sm:border-border sm:shadow-sm"
>
	<main class="px-6">
		<header class="mb-8 pt-4 flex items-center justify-between">
			<div class="mt-4">
				<p class="text-sm font-medium text-muted-foreground">Welcome back,</p>
				<h1 class="text-2xl font-bold tracking-tight">Harold B.</h1>
			</div>
			<div
				class="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary text-primary"
			>
				<LucideUserRound />
			</div>
		</header>

		<div
			class="relative mb-8 overflow-hidden rounded-2xl bg-primary p-6 text-primary-foreground shadow-md shadow-primary/20"
		>
			<div class="relative z-10 w-full">
				<h2 class="mb-1 text-xl font-bold">Ready to train?</h2>
				<p class="mb-6 text-sm text-primary-foreground/90">Start your AI-assisted workout now.</p>
				<Button variant="secondary" class="font-semibold text-primary hover:bg-secondary/90">
					<LucidePlay fill="currentColor" class="mr-2" />
					Quick Start
				</Button>
			</div>
			<LucideCamera class="absolute opacity-20 text-8xl" style="right:calc(var(--spacing) * -8); bottom: calc(var(--spacing) * -8)"/>
		</div>

		<section class="mb-8">
			<h3 class="mb-4 text-lg font-bold">Weekly Overview</h3>
			<div class="grid grid-cols-2 gap-4">
				<Card.Root class="border-border shadow-sm">
          <Card.Header class="p-4 pb-2">
            <Card.Title class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Workouts
            </Card.Title>
          </Card.Header>
          <Card.Content class="p-4 py-0">
            <p class="text-3xl font-black">4</p>
          </Card.Content>
          <Card.Footer class="p-4 pt-1">
            <p class="text-xs font-semibold text-primary">On track</p>
          </Card.Footer>
        </Card.Root>

                <Card.Root class="border-border shadow-sm">
          <Card.Header class="p-4 pb-2">
            <Card.Title class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Avg Form Score
            </Card.Title>
          </Card.Header>
          <Card.Content class="p-4 py-0">
            <p class="text-3xl font-black">88%</p>
          </Card.Content>
          <Card.Footer class="p-4 pt-1">
            <p class="text-xs font-semibold text-primary">+2% from last week</p>
          </Card.Footer>
        </Card.Root>
			</div>
		</section>

		<section>
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-lg font-bold">Recent Activity</h3>
				<a href={resolve("/")} class="text-sm font-semibold text-primary hover:underline">View All</a>
			</div>

			<div class="flex flex-col gap-3">
				<Card.Root class="flex flex-row items-center justify-between border-border p-4 shadow-sm transition-colors hover:bg-muted/50">
          <div class="flex items-center gap-4">
            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <LucideActivity />
            </div>
            <Card.Header class="p-0 space-y-0.5">
              <Card.Title class="text-sm font-bold sm:text-base">Lower Body (Squats)</Card.Title>
              <Card.Description class="text-xs">Today, 8:00 AM</Card.Description>
            </Card.Header>
          </div>
          <Card.Content class="p-0 text-right">
            <p class="text-lg font-black text-primary">92%</p>
            <p class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Form</p>
          </Card.Content>
        </Card.Root>

				<Card.Root class="flex flex-row items-center justify-between border-border p-4 shadow-sm transition-colors hover:bg-muted/50">
          <div class="flex items-center gap-4">
            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <LucideActivity />
            </div>
            <Card.Header class="p-0 space-y-0.5">
              <Card.Title class="text-sm font-bold sm:text-base">Upper Body (Pushups)</Card.Title>
              <Card.Description class="text-xs">Yesterday</Card.Description>
            </Card.Header>
          </div>
          <Card.Content class="p-0 text-right">
            <p class="text-lg font-black text-primary">85%</p>
            <p class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Form</p>
          </Card.Content>
        </Card.Root>
			</div>
		</section>
	</main>

	<nav class="pb-safe fixed bottom-0 z-50 w-full border-t border-border bg-background sm:max-w-md">
		<div class="relative flex h-16 items-center justify-between px-6">
			<button class="flex flex-col items-center gap-1 text-primary">
				<LucideHome/>
				<span class="text-[10px] font-bold">Home</span>
			</button>

			<button
				class="flex flex-col items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
			>
				<LucideBarChart2 />
				<span class="text-[10px] font-medium">Reports</span>
			</button>

			<div class="relative flex w-16 justify-center">
				<button
					class="absolute  flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-4 shadow-primary/30 ring-background transition-transform hover:scale-105 active:scale-95"
                    style="top:calc(var(--spacing) * -13);"
                >
					<LucideCamera />
				</button>
			</div>

			<button
				class="flex flex-col items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
			>
				<LucideUserRound />
				<span class="text-[10px] font-medium">Profile</span>
			</button>

			<button
				class="flex flex-col items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
			>
				<LucideSettings />
				<span class="text-[10px] font-medium">Settings</span>
			</button>
		</div>
	</nav>
</div>

<style>
	/* Safe area padding for iOS bottoms */
	.pb-safe {
		padding-bottom: env(safe-area-inset-bottom);
	}
</style>
