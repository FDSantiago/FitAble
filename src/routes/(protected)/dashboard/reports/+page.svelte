<script lang="ts">
	import LucideChevronRight from '~icons/lucide/chevron-right';
	import LucideTrendingUp from '~icons/lucide/trending-up';
	import LucideTrendingDown from '~icons/lucide/trending-down';
	import LucideMinus from '~icons/lucide/minus';
	import LucideDumbbell from '~icons/lucide/dumbbell';

	let { data } = $props();

	type Granularity = 'daily' | 'weekly' | 'monthly';
	let granularity = $state<Granularity>('daily');

	// ── helpers ──────────────────────────────────────────────────────────────

	function formatDate(iso: string) {
		const d = new Date(iso);
		return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}

	function scoreColor(score: number): string {
		if (score >= 85) return 'hsl(var(--primary))';
		if (score >= 70) return 'hsl(var(--warning, 38 92% 50%))';
		return 'hsl(var(--destructive))';
	}

	function scoreClass(score: number): string {
		if (score >= 85) return 'score-green';
		if (score >= 70) return 'score-yellow';
		return 'score-red';
	}

	// ── chart data ────────────────────────────────────────────────────────────

	const CHART_W = 320;
	const CHART_H = 80;
	const PAD_X = 10;
	const PAD_Y = 8;

	const dailyData = $derived(() => {
		const map = new Map<string, { total: number; count: number }>();
		data.sessions.forEach((s) => {
			const d = new Date(s.sessionDateTime);
			const key = d.toISOString().split('T')[0];
			const existing = map.get(key) ?? { total: 0, count: 0 };
			existing.total += s.averageFormScore;
			existing.count += 1;
			map.set(key, existing);
		});
		return Array.from(map.entries())
			.map(([key, val]) => ({
				label: new Date(key).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
				score: val.count > 0 ? val.total / val.count : null
			}))
			.sort((a, b) => new Date(a.label).getTime() - new Date(b.label).getTime());
	});

	const weeklyData = $derived(() => {
		const map = new Map<string, { total: number; count: number }>();
		data.sessions.forEach((s) => {
			const d = new Date(s.sessionDateTime);
			const weekStart = new Date(d);
			weekStart.setDate(d.getDate() - d.getDay());
			const key = weekStart.toISOString().split('T')[0];
			const existing = map.get(key) ?? { total: 0, count: 0 };
			existing.total += s.averageFormScore;
			existing.count += 1;
			map.set(key, existing);
		});
		return Array.from(map.entries())
			.map(([key, val]) => ({
				label: `Wk ${new Date(key).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
				score: val.count > 0 ? val.total / val.count : null
			}))
			.sort((a, b) => new Date(a.label).getTime() - new Date(b.label).getTime());
	});

	const chartData = $derived(() => {
		if (granularity === 'daily') return dailyData();
		if (granularity === 'weekly') return weeklyData();
		return data.monthlyData;
	});

	const chartPoints = $derived(() => {
		const withData = chartData().filter((m) => m.score !== null);
		if (withData.length < 2) return null;

		const scores = withData.map((m) => m.score as number);
		const minScore = Math.min(...scores) - 5;
		const maxScore = Math.max(...scores) + 5;
		const range = maxScore - minScore || 1;

		const points = withData.map((m, i) => {
			const x = PAD_X + (i / (withData.length - 1)) * (CHART_W - PAD_X * 2);
			const y = PAD_Y + (1 - ((m.score as number) - minScore) / range) * (CHART_H - PAD_Y * 2);
			return { x, y, score: m.score as number, label: m.label };
		});

		const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

		const areaD =
			pathD + ` L ${points.at(-1)!.x} ${CHART_H - PAD_Y} L ${points[0].x} ${CHART_H - PAD_Y} Z`;

		return { points, pathD, areaD, withData };
	});

	const allLabels = $derived(() => chartData());

	// ── session detail ────────────────────────────────────────────────────────

	let selectedSession = $state<(typeof data.sessions)[number] | null>(null);
</script>

<div class="relative min-h-screen bg-background pb-28 text-foreground">
	<div class="px-4 py-6 sm:px-6 md:px-10 lg:px-16">
		<main class="mx-auto w-full max-w-2xl">
			<!-- Header -->
			<header class="mb-6 flex items-center justify-between gap-4 pt-4">
				<h1 class="text-xl font-bold tracking-tight sm:text-2xl">Progress Reports</h1>

				<!-- Granularity toggle -->
				<div class="flex rounded-lg border border-border bg-muted p-0.5">
					{#each ['daily', 'weekly', 'monthly'] as const as g}
						<button
							type="button"
							class="rounded-md px-3 py-1.5 text-xs font-bold transition-all
							{granularity === g
								? 'bg-background text-foreground shadow-sm'
								: 'text-muted-foreground hover:text-foreground'}"
							onclick={() => (granularity = g)}
						>
							{g.charAt(0).toUpperCase() + g.slice(1)}
						</button>
					{/each}
				</div>
			</header>

			<!-- Average Form Score Card -->
			<section class="mb-6">
				<div class="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
					<!-- Headline -->
					<div class="flex items-start justify-between gap-4 px-5 pt-5 pb-2">
						<div>
							<p class="mb-1 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
								Average Form Score
							</p>
							<p class="text-4xl leading-none font-black tracking-tight">
								{data.overallAvgFormScore > 0 ? `${data.overallAvgFormScore}%` : '--'}
							</p>
						</div>

						<!-- Monthly trend badge -->
						{#if data.monthlyChange !== null}
							<div
								class="mt-1 flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-bold
								{data.monthlyChange >= 0
									? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
									: 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400'}"
							>
								{#if data.monthlyChange > 0}
									<LucideTrendingUp class="h-4 w-4" />
									+{data.monthlyChange}% this month
								{:else if data.monthlyChange < 0}
									<LucideTrendingDown class="h-4 w-4" />
									{data.monthlyChange}% this month
								{:else}
									<LucideMinus class="h-4 w-4" />
									No change
								{/if}
							</div>
						{/if}
					</div>

					<!-- Sparkline chart -->
					<div class="px-2 pb-1">
						{#if chartPoints() !== null}
							{@const cp = chartPoints()!}
							<svg
								viewBox="0 0 {CHART_W} {CHART_H}"
								width="100%"
								height="88"
								preserveAspectRatio="none"
								aria-hidden="true"
							>
								<defs>
									<linearGradient id="chartGrad" x1="0" x2="0" y1="0" y2="1">
										<stop
											offset="0%"
											stop-color="var(--color-primary, #10b981)"
											stop-opacity="0.18"
										/>
										<stop
											offset="100%"
											stop-color="var(--color-primary, #10b981)"
											stop-opacity="0"
										/>
									</linearGradient>
								</defs>
								<!-- Filled area -->
								<path d={cp.areaD} fill="url(#chartGrad)" />
								<!-- Line -->
								<path
									d={cp.pathD}
									fill="none"
									stroke="var(--color-primary, #10b981)"
									stroke-width="2.5"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
								<!-- Data points -->
								{#each cp.points as pt (pt.label)}
									<circle cx={pt.x} cy={pt.y} r="3.5" fill="var(--color-primary, #10b981)" />
								{/each}
							</svg>
						{:else}
							<!-- No chart data yet -->
							<div class="flex h-20 items-center justify-center">
								<p class="text-xs text-muted-foreground">Not enough data for chart</p>
							</div>
						{/if}
					</div>

					<!-- Month labels -->
					<div class="px-4 pb-4">
						<div class="flex justify-between">
							{#each allLabels() as m (m.label)}
								<span class="text-[10px] font-medium text-muted-foreground">{m.label}</span>
							{/each}
						</div>
					</div>
				</div>
			</section>

			<!-- Workout Log -->
			<section>
				<h2 class="mb-3 text-lg font-bold">Workout Log</h2>

				{#if data.sessions.length === 0}
					<div class="flex flex-col items-center justify-center gap-3 py-16 text-center">
						<div
							class="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary"
						>
							<LucideDumbbell class="h-8 w-8" />
						</div>
						<p class="font-bold">No workouts yet</p>
						<p class="max-w-xs text-sm text-muted-foreground">
							Complete your first workout to see your progress here.
						</p>
					</div>
				{:else}
					<div class="flex flex-col gap-2">
						{#each data.sessions as session (session.id)}
							<button
								type="button"
								class="group flex w-full cursor-pointer items-center justify-between rounded-2xl border border-border bg-card px-4 py-4 text-left shadow-sm transition-colors hover:bg-muted/50 active:bg-muted"
								onclick={() => {
									selectedSession = selectedSession?.id === session.id ? null : session;
								}}
								aria-expanded={selectedSession?.id === session.id}
								aria-label="View details for {session.exerciseName}"
							>
								<div class="min-w-0">
									<p class="text-sm leading-tight font-bold">{session.exerciseName}</p>
									<p class="mt-0.5 text-xs text-muted-foreground">
										{formatDate(session.sessionDateTime)} • {session.repsCompleted} Reps
									</p>
								</div>

								<div class="ml-4 flex shrink-0 items-center gap-2">
									<span
										class="text-lg font-black {scoreClass(session.averageFormScore)}"
										style="color: {scoreColor(session.averageFormScore)}"
									>
										{session.averageFormScore}%
									</span>
									<LucideChevronRight
										class="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
									/>
								</div>
							</button>

							<!-- Expandable detail panel -->
							{#if selectedSession?.id === session.id}
								<div
									class="-mt-1 mb-1 animate-in rounded-2xl border border-border bg-muted/30 px-4 py-4 duration-150 fade-in slide-in-from-top-2"
								>
									<div class="grid grid-cols-3 gap-3">
										<div class="text-center">
											<p
												class="text-[10px] font-bold tracking-wider text-muted-foreground uppercase"
											>
												Form Score
											</p>
											<p
												class="text-xl font-black"
												style="color: {scoreColor(session.averageFormScore)}"
											>
												{session.averageFormScore}%
											</p>
										</div>
										<div class="text-center">
											<p
												class="text-[10px] font-bold tracking-wider text-muted-foreground uppercase"
											>
												Reps
											</p>
											<p class="text-xl font-black">{session.repsCompleted}</p>
										</div>
										<div class="text-center">
											<p
												class="text-[10px] font-bold tracking-wider text-muted-foreground uppercase"
											>
												Duration
											</p>
											<p class="text-xl font-black">
												{session.durationMinutes}<span
													class="text-xs font-normal text-muted-foreground">m</span
												>
											</p>
										</div>
									</div>

									<!-- Score progress bar -->
									<div class="mt-4">
										<div class="mb-1 flex justify-between text-xs text-muted-foreground">
											<span>Form Quality</span>
											<span>{session.averageFormScore}%</span>
										</div>
										<div class="h-2 w-full overflow-hidden rounded-full bg-muted">
											<div
												class="h-full rounded-full transition-all duration-700"
												style="width: {session.averageFormScore}%; background-color: {scoreColor(
													session.averageFormScore
												)}"
											></div>
										</div>
									</div>
								</div>
							{/if}
						{/each}
					</div>
				{/if}
			</section>
		</main>
	</div>
</div>

<style>
	.score-green {
		color: var(--color-primary, #10b981);
	}
	.score-yellow {
		color: #f59e0b;
	}
	.score-red {
		color: #ef4444;
	}

	@keyframes slide-in-from-top-2 {
		from {
			opacity: 0;
			transform: translateY(-0.5rem);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	.animate-in {
		animation: slide-in-from-top-2 0.15s ease-out forwards;
	}
</style>
