<script lang="ts">
	import { PoseDetector } from '$lib/components/pose-detector/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import LucideArrowLeft from '~icons/lucide/arrow-left';
	import LucideRotateCcw from '~icons/lucide/rotate-ccw';
	import LucidePlay from '~icons/lucide/play';
	import { resolve } from '$app/paths';

	type Exercise = 'pushup' | 'squat' | 'situp' | 'jumpingjack';

	let selectedExercise: Exercise = $state('pushup');
	let exerciseState: 'ready' | 'down' | 'up' = $state('ready');
	let formFeedback = $state({ feedback: 'Get into position', score: 100 });
	let isSessionActive = $state(false);
	let currentSetReps = $state(0);
	let sets = $state<{ reps: number; formScore: number }[]>([]);
	let workoutDuration = $state(0);
	let durationInterval: ReturnType<typeof setInterval> | null = null;

	function selectExercise(exercise: Exercise) {
		if (isSessionActive) return;
		selectedExercise = exercise;
	}

	function startWorkout() {
		isSessionActive = true;
		currentSetReps = 0;
		sets = [];
		workoutDuration = 0;
		durationInterval = setInterval(() => {
			workoutDuration++;
		}, 1000);
	}

	function finishSet() {
		if (!isSessionActive || currentSetReps === 0) return;
		sets = [...sets, { reps: currentSetReps, formScore: 85 }];
		currentSetReps = 0;
	}

	function endWorkout() {
		if (sets.length > 0 && currentSetReps > 0) {
			sets = [...sets, { reps: currentSetReps, formScore: 85 }];
		}
		isSessionActive = false;
		if (durationInterval) {
			clearInterval(durationInterval);
			durationInterval = null;
		}
	}

	function handleRepCount(count: number) {
		currentSetReps = count;
	}

	function handleFormFeedback(feedback: string, score: number) {
		formFeedback = { feedback, score };
	}

	function handleStateChange(state: 'ready' | 'down' | 'up') {
		exerciseState = state;
	}

	function formatDuration(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}

	function getExerciseIcon(exercise: Exercise): string {
		switch (exercise) {
			case 'pushup':
				return '💪';
			case 'squat':
				return '🦵';
			case 'situp':
				return '🔥';
			case 'jumpingjack':
				return '⭐';
			default:
				return '💪';
		}
	}

	function getExerciseName(exercise: Exercise): string {
		switch (exercise) {
			case 'pushup':
				return 'Push-ups';
			case 'squat':
				return 'Squats';
			case 'situp':
				return 'Sit-ups';
			case 'jumpingjack':
				return 'Jumping Jacks';
			default:
				return 'Exercise';
		}
	}
</script>

<div class="flex min-h-screen flex-col bg-background pb-20">
	<header
		class="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur"
	>
		<a href={resolve('/dashboard')} class="text-muted-foreground hover:text-foreground">
			<LucideArrowLeft class="h-5 w-5" />
		</a>
		<div class="flex-1">
			<h1 class="text-base font-bold">Workout</h1>
		</div>
		{#if isSessionActive}
			<div class="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
				{formatDuration(workoutDuration)}
			</div>
		{/if}
	</header>

	{#if !isSessionActive}
		<div class="flex flex-1 flex-col gap-6 p-4">
			<section class="rounded-2xl bg-primary p-4 text-primary-foreground">
				<h2 class="mb-1 text-lg font-bold">Select Exercise</h2>
				<p class="text-sm text-primary-foreground/90">
					Choose an exercise to start your AI-assisted workout
				</p>
			</section>

			<div class="grid grid-cols-4 gap-3">
				{#each ['pushup', 'squat', 'situp', 'jumpingjack'] as exercise (exercise)}
					<button
						type="button"
						class="flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all {selectedExercise ===
						exercise
							? 'border-primary bg-primary/5'
							: 'border-border hover:border-primary/50'}"
						onclick={() => selectExercise(exercise as Exercise)}
					>
						<span class="text-3xl">{getExerciseIcon(exercise as Exercise)}</span>
						<span class="text-xs font-bold">{getExerciseName(exercise as Exercise)}</span>
					</button>
				{/each}
			</div>

			<section class="rounded-xl border border-border p-4">
				<h3 class="mb-3 text-sm font-bold">Exercise Guide</h3>
				<div class="space-y-2 text-xs text-muted-foreground">
					{#if selectedExercise === 'pushup'}
						<p>
							<strong>Push-ups:</strong> Keep your body straight, lower until your elbows are at 90 degrees,
							then push up.
						</p>
						<p class="text-muted-foreground/70">Target angle: ~90° at bottom, ~180° at top</p>
					{:else if selectedExercise === 'squat'}
						<p>
							<strong>Squats:</strong> Stand with feet shoulder-width apart, lower until thighs are parallel
							to ground.
						</p>
						<p class="text-muted-foreground/70">Target angle: ~90° at bottom, ~180° at top</p>
					{:else if selectedExercise === 'situp'}
						<p>
							<strong>Sit-ups:</strong> Lie on your back, knees bent, raise your torso to your knees.
						</p>
						<p class="text-muted-foreground/70">Target angle: ~60° at bottom, ~120°+ at top</p>
					{:else if selectedExercise === 'jumpingjack'}
						<p>
							<strong>Jumping Jacks:</strong> Jump while spreading legs and raising arms overhead, then
							return to starting position.
						</p>
						<p class="text-muted-foreground/70">
							Target angle: Arms together at top (~45°), arms apart at bottom (~165°)
						</p>
					{/if}
				</div>
			</section>

			<div class="mt-auto">
				<Button class="w-full" size="lg" onclick={startWorkout}>
					<LucidePlay class="mr-2 h-5 w-5" />
					Start Workout
				</Button>
			</div>
		</div>
	{:else}
		<div class="flex flex-1 flex-col gap-4 p-4">
			<div class="relative overflow-hidden rounded-2xl bg-black">
				<PoseDetector
					exercise={selectedExercise}
					onRepCount={handleRepCount}
					onFormFeedback={handleFormFeedback}
					onStateChange={handleStateChange}
				/>
				<div class="absolute right-3 bottom-3 left-3 rounded-xl bg-black/70 p-3 text-white">
					<div class="mb-2 flex items-center justify-between">
						<span class="text-sm font-bold">{getExerciseName(selectedExercise)}</span>
						<span
							class="rounded-full px-2 py-0.5 text-xs font-bold {exerciseState === 'down'
								? 'bg-green-500'
								: exerciseState === 'up'
									? 'bg-blue-500'
									: 'bg-yellow-500'}"
						>
							{exerciseState === 'down' ? 'Down' : exerciseState === 'up' ? 'Up' : 'Ready'}
						</span>
					</div>
					<p class="text-xl text-white/80">{formFeedback.feedback}</p>
				</div>
			</div>

			<div class="grid grid-cols-2 gap-3">
				<div class="rounded-xl border border-border p-4 text-center">
					<p class="text-4xl font-black text-primary">{currentSetReps}</p>
					<p class="text-xs font-bold text-muted-foreground">Current Reps</p>
				</div>
				<div class="rounded-xl border border-border p-4 text-center">
					<p
						class="text-4xl font-black {formFeedback.score >= 70
							? 'text-green-500'
							: 'text-yellow-500'}"
					>
						{formFeedback.score}%
					</p>
					<p class="text-xs font-bold text-muted-foreground">Form Score</p>
				</div>
			</div>

			{#if sets.length > 0}
				<div class="rounded-xl border border-border p-4">
					<h3 class="mb-3 text-sm font-bold">Completed Sets</h3>
					<div class="space-y-2">
						{#each sets as set, i (i)}
							<div class="flex items-center justify-between text-sm">
								<span class="font-medium">Set {i + 1}</span>
								<span class="text-muted-foreground">{set.reps} reps</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<div class="mt-auto flex gap-3">
				<Button
					variant="outline"
					class="flex-1"
					size="lg"
					onclick={() => {
						currentSetReps = 0;
					}}
				>
					<LucideRotateCcw class="mr-2 h-5 w-5" />
					Reset Reps
				</Button>
				<Button variant="secondary" class="flex-1" size="lg" onclick={finishSet}>Finish Set</Button>
				<Button variant="destructive" class="flex-1" size="lg" onclick={endWorkout}>
					End Workout
				</Button>
			</div>
		</div>
	{/if}
</div>
