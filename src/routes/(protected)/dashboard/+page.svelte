<script lang="ts">
	import LucideUserRound from '~icons/lucide/user-round';
	import LucidePlay from '~icons/lucide/play';
	import LucideCamera from '~icons/lucide/camera';
	import LucideActivity from '~icons/lucide/activity';
	import LucideTrendingUp from '~icons/lucide/trending-up';
	import LucideTrendingDown from '~icons/lucide/trending-down';
	import LucideMinus from '~icons/lucide/minus';
	import LucideClock from '~icons/lucide/clock';
	import LucideDumbbell from '~icons/lucide/dumbbell';
	import LucideTarget from '~icons/lucide/target';

	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/index.js';

	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';

	let { data } = $props();

	const weeklyStats = $derived(data.weeklyStats);
	const recentSessions = $derived(data.recentSessions);

	function formatRelativeTime(isoString: string): string {
		const date = new Date(isoString);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

		if (diffDays === 0) {
			const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
			if (diffHours === 0) {
				const diffMins = Math.floor(diffMs / (1000 * 60));
				return diffMins <= 1 ? 'Just now' : `${diffMins}m ago`;
			}
			return diffHours === 1 ? '1h ago' : `${diffHours}h ago`;
		}
		if (diffDays === 1) return 'Yesterday';
		if (diffDays < 7) return `${diffDays} days ago`;
		return date.toLocaleDateString('default', { month: 'short', day: 'numeric' });
	}

	function getFormColor(score: number): string {
		if (score >= 80) return 'text-primary';
		if (score >= 60) return 'text-amber-500';
		return 'text-destructive';
	}

	const onTrack = $derived(weeklyStats.workoutCount >= Math.ceil(weeklyStats.weeklyGoal / 2));
	const weeklyProgress = $derived(
		Math.min(100, Math.round((weeklyStats.workoutCount / weeklyStats.weeklyGoal) * 100))
	);
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
					{#if data.user.image}
						<img
							src={data.user.image}
							alt={data.user.name}
							class="h-full w-full rounded-full object-cover"
						/>
					{:else}
						<LucideUserRound />
					{/if}
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
					<Button
						variant="secondary"
						class="font-semibold text-primary hover:bg-secondary/90"
						onclick={() => goto(resolve('/workout'))}
					>
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
					<!-- Workouts this week -->
					<Card.Root class="border-border shadow-sm">
						<Card.Header class="p-3 pb-2 sm:p-4">
							<Card.Title
								class="text-[10px] font-bold tracking-wider text-muted-foreground uppercase"
							>
								Workouts
							</Card.Title>
						</Card.Header>
						<Card.Content class="p-3 py-0 sm:p-4">
							<p class="text-2xl font-black sm:text-3xl">{weeklyStats.workoutCount}</p>
						</Card.Content>
						<Card.Footer class="p-3 pt-1 sm:p-4">
							{#if weeklyStats.workoutCount === 0}
								<p class="text-xs font-semibold text-muted-foreground">No sessions yet</p>
							{:else if onTrack}
								<p class="text-xs font-semibold text-primary">
									On track · {weeklyStats.workoutCount}/{weeklyStats.weeklyGoal} goal
								</p>
							{:else}
								<p class="text-xs font-semibold text-amber-500">
									{weeklyStats.weeklyGoal - weeklyStats.workoutCount} more to hit goal
								</p>
							{/if}
						</Card.Footer>
					</Card.Root>

					<!-- Avg Form Score -->
					<Card.Root class="border-border shadow-sm">
						<Card.Header class="p-3 pb-2 sm:p-4">
							<Card.Title
								class="text-[10px] font-bold tracking-wider text-muted-foreground uppercase"
							>
								Avg Form Score
							</Card.Title>
						</Card.Header>
						<Card.Content class="p-3 py-0 sm:p-4">
							{#if weeklyStats.avgFormScore !== null}
								<p class="text-2xl font-black sm:text-3xl">{weeklyStats.avgFormScore}%</p>
							{:else}
								<p class="text-2xl font-black text-muted-foreground sm:text-3xl">--</p>
							{/if}
						</Card.Content>
						<Card.Footer class="p-3 pt-1 sm:p-4">
							{#if weeklyStats.formScoreChange !== null}
								<div class="flex items-center gap-1">
									{#if weeklyStats.formScoreChange > 0}
										<LucideTrendingUp class="h-3.5 w-3.5 text-primary" />
										<p class="text-xs font-semibold text-primary">
											+{weeklyStats.formScoreChange}% from last week
										</p>
									{:else if weeklyStats.formScoreChange < 0}
										<LucideTrendingDown class="h-3.5 w-3.5 text-destructive" />
										<p class="text-xs font-semibold text-destructive">
											{weeklyStats.formScoreChange}% from last week
										</p>
									{:else}
										<LucideMinus class="h-3.5 w-3.5 text-muted-foreground" />
										<p class="text-xs font-semibold text-muted-foreground">Same as last week</p>
									{/if}
								</div>
							{:else if weeklyStats.avgFormScore !== null}
								<p class="text-xs font-semibold text-muted-foreground">No previous data</p>
							{:else}
								<p class="text-xs font-semibold text-muted-foreground">No sessions this week</p>
							{/if}
						</Card.Footer>
					</Card.Root>
				</div>

				<!-- Weekly progress bar -->
				{#if weeklyStats.weeklyGoal > 0}
					<div class="mt-3 rounded-xl border border-border bg-card p-3 shadow-sm sm:p-4">
						<div class="mb-2 flex items-center justify-between">
							<p class="text-xs font-semibold text-muted-foreground">Weekly Goal Progress</p>
							<p class="text-xs font-bold">
								{weeklyStats.workoutCount}/{weeklyStats.weeklyGoal} sessions
							</p>
						</div>
						<div class="h-2 w-full overflow-hidden rounded-full bg-muted">
							<div
								class="h-full rounded-full bg-primary transition-all duration-500"
								style="width: {weeklyProgress}%"
							></div>
						</div>
					</div>
				{/if}

				<!-- Active Fitness Goals -->
				{#if data.activeGoals && data.activeGoals.length > 0}
					<div class="mt-3 rounded-xl border border-border bg-card p-3 shadow-sm sm:p-4">
						<div class="mb-3 flex items-center justify-between">
							<p class="text-xs font-semibold text-muted-foreground">Active Goals</p>
							<a
								href={resolve('/dashboard/goals')}
								class="text-xs font-semibold text-primary hover:underline"
							>
								View All
							</a>
						</div>
						<div class="flex flex-col gap-3">
							{#each data.activeGoals as goal (goal.id)}
								<div class="flex items-center justify-between">
									<div class="flex items-center gap-2">
										<LucideTarget class="h-4 w-4 text-primary" />
										<span class="text-sm font-medium">{goal.title}</span>
									</div>
									<div class="text-right">
										<span class="text-xs font-bold text-primary">{goal.progress}%</span>
										<p class="text-[10px] text-muted-foreground">
											{goal.completedWorkouts}/{goal.targetWorkouts} workouts · {goal.daysLeft}d
											left
										</p>
									</div>
								</div>
								<div class="h-1.5 w-full overflow-hidden rounded-full bg-muted">
									<div
										class="h-full rounded-full bg-primary transition-all duration-500"
										style="width: {goal.progress}%"
									></div>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</section>

			<section>
				<div class="mb-3 flex items-center justify-between sm:mb-4">
					<h3 class="text-base font-bold sm:text-lg">Recent Activity</h3>
					<a
						href={resolve('/dashboard/reports')}
						class="text-sm font-semibold text-primary hover:underline"
					>
						View All
					</a>
				</div>

				{#if recentSessions.length === 0}
					<div
						class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-10 text-center"
					>
						<LucideDumbbell class="mb-3 h-10 w-10 text-muted-foreground/40" />
						<p class="text-sm font-semibold text-muted-foreground">No workouts yet</p>
						<p class="mt-1 text-xs text-muted-foreground/70">
							Complete your first session to see your activity here.
						</p>
					</div>
				{:else}
					<div class="flex flex-col gap-3">
						{#each recentSessions as session (session.id)}
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
										<Card.Title class="text-sm font-bold sm:text-base">
											{session.exerciseName}
										</Card.Title>
										<Card.Description class="flex items-center gap-2 text-xs">
											<span>{formatRelativeTime(session.sessionDateTime)}</span>
											<span class="text-muted-foreground/40">·</span>
											<LucideClock class="h-3 w-3" />
											<span>{session.durationMinutes}m</span>
											<span class="text-muted-foreground/40">·</span>
											<span>{session.repsCompleted} reps</span>
										</Card.Description>
									</Card.Header>
								</div>
								<Card.Content class="p-0 text-left sm:text-right">
									<p class="text-lg font-black {getFormColor(session.averageFormScore)}">
										{session.averageFormScore}%
									</p>
									<p class="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
										Form
									</p>
								</Card.Content>
							</Card.Root>
						{/each}
					</div>
				{/if}
			</section>
		</main>
	</div>
</div>
