<script lang="ts">
	import { resolve } from '$app/paths';
	import { APP_NAME } from '$lib/config.js';
	import Button from '$lib/components/ui/button/button.svelte';

	import LucideActivity from '~icons/lucide/activity';
	import LucideTarget from '~icons/lucide/target';
	import LucideBarChart3 from '~icons/lucide/bar-chart-3';
	import LucideZap from '~icons/lucide/zap';
	import LucideShieldCheck from '~icons/lucide/shield-check';
	import LucideUsers from '~icons/lucide/users';

	let { data } = $props();
</script>

<div class="min-h-screen bg-background">
	<header class="border-b">
		<div class="container mx-auto flex h-16 items-center justify-between px-4">
			<div class="flex items-center gap-2">
				<LucideActivity class="size-6 text-primary" />
				<span class="text-xl font-bold">{APP_NAME}</span>
			</div>
			<nav class="flex items-center gap-4">
				{#if data.user}
					<Button href={resolve('/dashboard')} size="sm">Dashboard</Button>
				{:else}
					<a href={resolve('/login')} class="text-sm font-medium hover:text-primary">Login</a>
					<Button href={resolve('/register')} size="sm">Get Started</Button>
				{/if}
			</nav>
		</div>
	</header>

	<main>
		<section class="relative overflow-hidden py-20 md:py-32">
			<div
				class="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"
			></div>
			<div class="container mx-auto px-4 text-center">
				<div
					class="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-sm shadow-sm"
				>
					<LucideZap class="size-3.5 text-primary" />
					<span>AI-Powered Exercise Tracking</span>
				</div>
				<h1 class="mt-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
					Smart Fitness<br />
					<span class="text-primary">Starts Here</span>
				</h1>
				<p class="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
					Track your workouts, analyze your form, and achieve your goals with AI-powered exercise
					tracking and real-time form correction.
				</p>
				<div class="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
					{#if data.user}
						<Button href={resolve('/dashboard')} size="lg">Go to Dashboard</Button>
					{:else}
						<Button href={resolve('/register')} size="lg">Get Started</Button>
						<Button href={resolve('/login')} variant="outline" size="lg">Login</Button>
					{/if}
				</div>
			</div>
		</section>

		<section class="py-16 md:py-24">
			<div class="container mx-auto px-4">
				<div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
					<div class="rounded-xl border bg-card p-6 shadow-sm">
						<div class="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
							<LucideTarget class="size-6 text-primary" />
						</div>
						<h3 class="mb-2 text-xl font-semibold">Goal Tracking</h3>
						<p class="text-muted-foreground">
							Set personalized fitness goals and track your progress with detailed analytics and
							insights.
						</p>
					</div>
					<div class="rounded-xl border bg-card p-6 shadow-sm">
						<div class="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
							<LucideBarChart3 class="size-6 text-primary" />
						</div>
						<h3 class="mb-2 text-xl font-semibold">Exercise Analytics</h3>
						<p class="text-muted-foreground">
							Monitor your performance with comprehensive charts and real-time statistics.
						</p>
					</div>
					<div class="rounded-xl border bg-card p-6 shadow-sm">
						<div class="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
							<LucideShieldCheck class="size-6 text-primary" />
						</div>
						<h3 class="mb-2 text-xl font-semibold">Form Correction</h3>
						<p class="text-muted-foreground">
							Get AI-powered feedback on your exercise form to prevent injuries and maximize gains.
						</p>
					</div>
				</div>
			</div>
		</section>

		{#if !data.user}
			<section class="py-16 md:py-24">
				<div class="container mx-auto px-4 text-center">
					<div class="mx-auto max-w-2xl">
						<LucideUsers class="mx-auto mb-4 size-12 text-primary" />
						<h2 class="text-3xl font-bold tracking-tight sm:text-4xl">
							Ready to Transform Your Fitness?
						</h2>
						<p class="mt-4 text-muted-foreground">
							Join thousands of users who have already started their fitness journey with {APP_NAME}.
						</p>
						<Button href={resolve('/register')} size="lg" class="mt-6">Create Free Account</Button>
					</div>
				</div>
			</section>
		{/if}
	</main>

	<footer class="border-t py-8">
		<div class="container mx-auto px-4 text-center text-sm text-muted-foreground">
			&copy; {new Date().getFullYear()}
			{APP_NAME}. All rights reserved.
		</div>
	</footer>
</div>
