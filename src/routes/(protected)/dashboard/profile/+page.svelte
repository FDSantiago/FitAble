<script lang="ts">
	import LucideUser from '~icons/lucide/user';
	import LucidePencil from '~icons/lucide/pencil';
	import LucideTarget from '~icons/lucide/target';
	import LucideLogOut from '~icons/lucide/log-out';
	import { Button } from '$lib/components/ui/button';

	let { data } = $props();

	const user = {
		name: data.user.name,
		course: undefined,
		id: data.user.email,
		weight: 68,
		height: 175,
		bmi: 22.2,
		bmiStatus: 'NORMAL'
	};

	const goals = {
		title: 'Workout 3x a Week',
		progress: 2,
		target: 3
	};

	const stats = {
		totalWorkouts: 24,
		timeTrained: '12h'
	};
</script>

<div class="relative min-h-screen bg-background pb-24 text-foreground">
	<div class="px-4 py-6 sm:px-6 md:px-10 lg:px-16">
		<main class="mx-auto w-full max-w-7xl">
			<header class="mb-6 flex items-center justify-between pt-4 md:mb-8">
				<h1 class="text-xl font-bold tracking-tight sm:text-2xl">Student Profile</h1>
				<Button variant="ghost" size="icon" class="h-10 w-10 rounded-full hover:bg-muted">
					<LucidePencil class="h-5 w-5 text-primary" />
				</Button>
			</header>

			<div class="mb-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
				<div class="flex flex-col items-center text-center">
					<div
						class="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary"
					>
						<LucideUser class="h-10 w-10" />
					</div>
					<h2 class="text-lg font-bold sm:text-xl">{user.name}</h2>
					<p class="text-sm text-muted-foreground">{user.course}</p>
					<div class="mt-3 inline-flex items-center rounded-full bg-primary/10 px-3 py-1">
						<span class="text-xs font-medium text-primary">{user.id}</span>
					</div>
				</div>
			</div>

			<section class="mb-6">
				<h3 class="mb-3 text-sm font-bold text-foreground">Body Metrics</h3>
				<div class="grid grid-cols-3 gap-3">
					<div class="rounded-xl border border-border bg-card p-4 text-center shadow-sm">
						<p class="mb-1 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
							Weight
						</p>
						<p class="text-lg font-bold">
							{user.weight}<span class="text-xs font-normal text-muted-foreground">kg</span>
						</p>
					</div>
					<div class="rounded-xl border border-border bg-card p-4 text-center shadow-sm">
						<p class="mb-1 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
							Height
						</p>
						<p class="text-lg font-bold">
							{user.height}<span class="text-xs font-normal text-muted-foreground">cm</span>
						</p>
					</div>
					<div class="rounded-xl border border-border bg-card p-4 text-center shadow-sm">
						<p class="mb-1 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
							BMI
						</p>
						<p class="text-lg font-bold">{user.bmi}</p>
						<p class="text-[10px] font-bold text-primary">{user.bmiStatus}</p>
					</div>
				</div>
			</section>

			<section class="mb-6">
				<h3 class="mb-3 text-sm font-bold text-foreground">Current Goals</h3>
				<div class="rounded-xl border border-border bg-card p-4 shadow-sm">
					<div class="flex items-center gap-4">
						<div
							class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
						>
							<LucideTarget class="h-6 w-6" />
						</div>
						<div class="flex-1">
							<p class="font-bold text-foreground">{goals.title}</p>
							<p class="text-xs text-muted-foreground">
								Currently at {goals.progress}/{goals.target} this week
							</p>
							<div class="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
								<div
									class="h-full rounded-full bg-primary transition-all"
									style="width: {(goals.progress / goals.target) * 100}%"
								></div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section class="mb-6">
				<h3 class="mb-3 text-sm font-bold text-foreground">Lifetime Statistics</h3>
				<div class="grid grid-cols-2 gap-3">
					<div class="rounded-xl border border-border bg-card p-4 shadow-sm">
						<p class="text-2xl font-black">{stats.totalWorkouts}</p>
						<p class="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
							Total Workouts
						</p>
					</div>
					<div class="rounded-xl border border-border bg-card p-4 shadow-sm">
						<p class="text-2xl font-black">{stats.timeTrained}</p>
						<p class="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
							Time Trained
						</p>
					</div>
				</div>
			</section>

			<Button
				variant="outline"
				class="w-full gap-2 border-border py-6 text-destructive hover:bg-destructive/10 hover:text-destructive"
			>
				<LucideLogOut class="h-4 w-4" />
				<span class="font-semibold">Log Out of Account</span>
			</Button>
		</main>
	</div>
</div>
