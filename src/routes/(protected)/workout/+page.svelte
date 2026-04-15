<script lang="ts">
	import { PoseDetector } from '$lib/components/pose-detector/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import PerformanceChart from '$lib/components/ui/charts/performance-chart.svelte';
	import LucideArrowLeft from '~icons/lucide/arrow-left';
	import LucideRotateCcw from '~icons/lucide/rotate-ccw';
	import LucidePlay from '~icons/lucide/play';
	import LucideCheck from '~icons/lucide/check';
	import LucideShieldAlert from '~icons/lucide/shield-alert';
	import LucideMic from '~icons/lucide/mic';
	import LucideMicOff from '~icons/lucide/mic-off';
	import LucideVolume2 from '~icons/lucide/volume-2';
	import LucideVolumeX from '~icons/lucide/volume-x';
	import { resolve } from '$app/paths';
	import { toast } from 'svelte-sonner';
	import { enhance } from '$app/forms';
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { voiceCoach } from '$lib/components/voice-coach/voice-coach';
	import {
		voiceRecognition,
		type VoiceCommand
	} from '$lib/components/voice-coach/voice-recognition';

	type Exercise = 'pushup' | 'squat' | 'situp' | 'jumpingjack';

	let selectedExercise: Exercise = $state('pushup');
	let exerciseState: 'ready' | 'down' | 'up' = $state('ready');
	let formFeedback = $state({ feedback: 'Get into position', score: 100 });
	let isSessionActive = $state(false);
	let currentSetReps = $state(0);
	let sets = $state<{ reps: number; formScore: number }[]>([]);
	let workoutDuration = $state(0);
	let durationInterval: ReturnType<typeof setInterval> | null = null;

	// Saving / summary state
	let isSaving = $state(false);
	let completedWorkout = $state<{
		exercise: Exercise;
		totalReps: number;
		avgFormScore: number;
		durationSeconds: number;
		sets: { reps: number; formScore: number }[];
	} | null>(null);

	// Running average for form score (avoids per-rep array)
	let formScoreSampleCount = $state(0);
	let formScoreRunningSum = $state(0);

	// Safety alert state
	let safetyAlertVisible = $state(false);
	let safetyAlertDismissTimer: ReturnType<typeof setTimeout> | null = null;
	const SAFETY_ALERT_DELAY = 5000; // 5 seconds of bad form

	// ─── Voice state ─────────────────────────────────────────────────────────
	let voiceCoachEnabled = $state(true);
	let voiceRecognitionActive = $state(false);
	let voiceCoachSupported = $state(false);
	let voiceRecognitionSupported = $state(false);
	/** Last recognised transcript shown in the UI briefly */
	let lastTranscript = $state('');
	let transcriptTimer: ReturnType<typeof setTimeout> | null = null;

	let workoutCompletionResult = $state({});

	function selectExercise(exercise: Exercise) {
		if (isSessionActive) return;
		selectedExercise = exercise;
	}

	function startWorkout() {
		isSessionActive = true;
		currentSetReps = 0;
		sets = [];
		workoutDuration = 0;
		formScoreSampleCount = 0;
		formScoreRunningSum = 0;
		completedWorkout = null;
		durationInterval = setInterval(() => {
			workoutDuration++;
		}, 1000);
		voiceCoach.sayWorkoutStarted(getExerciseName(selectedExercise));
	}

	function finishSet() {
		if (!isSessionActive || currentSetReps === 0) return;
		const newSets = [
			...sets,
			{
				reps: currentSetReps,
				formScore: Math.round(formScoreRunningSum / Math.max(formScoreSampleCount, 1))
			}
		];
		sets = newSets;
		voiceCoach.saySetComplete(newSets.length, currentSetReps);
		currentSetReps = 0;
	}

	function endWorkout() {
		// Flush any in-progress set
		const finalSets = [...sets];
		if (currentSetReps > 0) {
			finalSets.push({
				reps: currentSetReps,
				formScore: Math.round(formScoreRunningSum / Math.max(formScoreSampleCount, 1))
			});
		}

		const totalReps = finalSets.reduce((sum, s) => sum + s.reps, 0);
		const avgFormScore =
			formScoreSampleCount > 0 ? Math.round(formScoreRunningSum / formScoreSampleCount) : 100;

		// Snapshot data for the hidden form
		completedWorkout = {
			exercise: selectedExercise,
			totalReps,
			avgFormScore,
			durationSeconds: workoutDuration,
			sets: finalSets
		};

		isSessionActive = false;
		if (durationInterval) {
			clearInterval(durationInterval);
			durationInterval = null;
		}
		// Clean up safety alert state
		safetyAlertVisible = false;
		if (safetyAlertDismissTimer) {
			clearTimeout(safetyAlertDismissTimer);
			safetyAlertDismissTimer = null;
		}
		voiceCoach.sayWorkoutEnded();
	}

	function handleRepCount(count: number) {
		currentSetReps = count;
		voiceCoach.sayRepMilestone(count);
	}

	function handleFormFeedback(feedback: string, score: number) {
		formFeedback = { feedback, score };
		// Accumulate for running average
		formScoreRunningSum += score;
		formScoreSampleCount++;
		// Dismiss safety alert when form improves
		if (score >= 70 && safetyAlertVisible) {
			safetyAlertVisible = false;
		}
		// Voice form warnings (cooldown handled inside voiceCoach)
		voiceCoach.sayFormWarning(score);
	}

	function handleStateChange(state: 'ready' | 'down' | 'up') {
		exerciseState = state;
		voiceCoach.sayStateChange(state);
	}

	function handleSafetyAlert(_durationMs: number) {
		safetyAlertVisible = true;

		// Auto-hide the in-UI banner after 8 seconds
		if (safetyAlertDismissTimer) clearTimeout(safetyAlertDismissTimer);
		safetyAlertDismissTimer = setTimeout(() => {
			safetyAlertVisible = false;
		}, 8000);

		voiceCoach.saySafetyAlert();
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

	function resetToStart() {
		completedWorkout = null;
		sets = [];
		currentSetReps = 0;
		workoutDuration = 0;
		formScoreSampleCount = 0;
		formScoreRunningSum = 0;
	}

	function autoSubmit(node: HTMLFormElement) {
		// Small timeout to ensure DOM and listeners are fully ready
		setTimeout(() => {
			node.requestSubmit();
		}, 0);
	}

	// ─── Voice control helpers ────────────────────────────────────────────────

	function toggleVoiceCoach() {
		const isNowEnabled = voiceCoach.toggle();
		voiceCoachEnabled = isNowEnabled;
		toast(isNowEnabled ? '🔊 Voice coach enabled' : '🔇 Voice coach muted');
	}

	async function toggleVoiceRecognition() {
		if (!voiceRecognitionSupported) {
			toast.warning('Voice recognition is not supported in this browser.');
			return;
		}
		const isNowListening = voiceRecognition.toggle();
		voiceRecognitionActive = isNowListening;
		if (isNowListening) {
			toast.info('🎤 Listening for voice commands…');
		} else {
			toast.info('🎤 Voice recognition stopped.');
		}
	}

	function showTranscript(text: string) {
		lastTranscript = text;
		if (transcriptTimer) clearTimeout(transcriptTimer);
		transcriptTimer = setTimeout(() => {
			lastTranscript = '';
		}, 2500);
	}

	function handleVoiceCommand(event: Event) {
		const e = event as CustomEvent<{ command: VoiceCommand; transcript: string }>;
		const { command, transcript } = e.detail;
		showTranscript(`"${transcript}"`);

		switch (command) {
			case 'start':
				if (!isSessionActive && !completedWorkout) startWorkout();
				break;
			case 'finish-set':
				if (isSessionActive) finishSet();
				break;
			case 'reset':
				if (isSessionActive) currentSetReps = 0;
				break;
			case 'end-workout':
				if (isSessionActive) endWorkout();
				break;
			case 'mute':
				if (voiceCoachEnabled) toggleVoiceCoach();
				break;
			case 'unmute':
				if (!voiceCoachEnabled) toggleVoiceCoach();
				break;
		}
	}

	onMount(() => {
		if (!browser) return;
		voiceCoachSupported = voiceCoach.isSupported;
		voiceRecognitionSupported = voiceRecognition.isSupported;
		document.addEventListener('voicecommand', handleVoiceCommand);
	});

	onDestroy(() => {
		if (!browser) return;
		document.removeEventListener('voicecommand', handleVoiceCommand);
		voiceRecognition.stop();
		voiceCoach.disable();
		if (transcriptTimer) clearTimeout(transcriptTimer);
	});
</script>

<div class="flex h-screen flex-col overflow-hidden bg-background">
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

		<!-- Voice controls (always visible during session; also shown on start screen) -->
		<div class="flex items-center gap-1.5">
			{#if voiceCoachSupported}
				<button
					id="voice-coach-toggle"
					type="button"
					title={voiceCoachEnabled ? 'Mute voice coach' : 'Enable voice coach'}
					class="relative flex h-8 w-8 items-center justify-center rounded-full border transition-all
						{voiceCoachEnabled
						? 'border-primary bg-primary/10 text-primary hover:bg-primary/20'
						: 'border-border bg-card text-muted-foreground hover:border-primary/50'}"
					onclick={toggleVoiceCoach}
				>
					{#if voiceCoachEnabled}
						<LucideVolume2 class="h-4 w-4" />
					{:else}
						<LucideVolumeX class="h-4 w-4" />
					{/if}
				</button>
			{/if}

			{#if voiceRecognitionSupported}
				<button
					id="voice-recognition-toggle"
					type="button"
					title={voiceRecognitionActive ? 'Stop listening' : 'Start voice commands'}
					class="relative flex h-8 w-8 items-center justify-center rounded-full border transition-all
						{voiceRecognitionActive
						? 'border-rose-500 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20'
						: 'border-border bg-card text-muted-foreground hover:border-primary/50'}"
					onclick={toggleVoiceRecognition}
				>
					{#if voiceRecognitionActive}
						<!-- Pulsing ring when listening -->
						<span
							class="absolute inset-0 animate-ping rounded-full border-2 border-rose-500/60 opacity-75"
						></span>
						<LucideMic class="h-4 w-4" />
					{:else}
						<LucideMicOff class="h-4 w-4" />
					{/if}
				</button>
			{/if}
		</div>
	</header>

	<!-- Floating transcript banner (fades in when a voice command is heard) -->
	{#if lastTranscript}
		<div
			class="animate-fade-in fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full border border-rose-500/30 bg-background/90 px-4
				py-1.5 text-xs font-medium text-rose-400 shadow-lg backdrop-blur"
		>
			🎤 {lastTranscript}
		</div>
	{/if}

	{#if !isSessionActive && !completedWorkout}
		<div class="flex flex-1 flex-col gap-6 overflow-y-auto p-4 pb-20">
			<section class="rounded-2xl bg-primary p-4 text-primary-foreground">
				<h2 class="mb-1 text-lg font-bold">Select Exercise</h2>
				<p class="text-sm text-primary-foreground/90">
					Choose an exercise to start your AI-assisted workout
				</p>
			</section>

			<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
				{#each ['pushup', 'squat', 'situp', 'jumpingjack'] as exercise (exercise)}
					<button
						type="button"
						class="flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all {selectedExercise ===
						exercise
							? 'border-primary bg-primary/5'
							: 'border-border hover:border-primary/50'}"
						onclick={() => selectExercise(exercise as Exercise)}
						aria-label="Select {getExerciseName(exercise as Exercise)} exercise"
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
						<p class="text-muted-foreground/70">Target angle: 70-110° at bottom, 160-180° at top</p>
					{:else if selectedExercise === 'squat'}
						<p>
							<strong>Squats:</strong> Stand with feet shoulder-width apart, lower until thighs are parallel
							to ground.
						</p>
						<p class="text-muted-foreground/70">Target angle: 70-110° at bottom, 160-180° at top</p>
					{:else if selectedExercise === 'situp'}
						<p>
							<strong>Sit-ups:</strong> Lie on your back, knees bent, raise your torso to your knees.
						</p>
						<p class="text-muted-foreground/70">Target angle: 70-110° at bottom, 160-180° at top</p>
					{:else if selectedExercise === 'jumpingjack'}
						<p>
							<strong>Jumping Jacks:</strong> Jump while spreading legs and raising arms overhead, then
							return to starting position.
						</p>
						<p class="text-muted-foreground/70">Target angle: 70-110° at bottom, 160-180° at top</p>
					{/if}
				</div>
			</section>

			<!-- Voice commands hint -->
			{#if voiceRecognitionSupported}
				<section class="rounded-xl border border-border/60 bg-muted/30 p-4">
					<div class="mb-2 flex items-center gap-2">
						<LucideMic class="h-3.5 w-3.5 text-primary" />
						<h3 class="text-xs font-bold">Voice Commands</h3>
					</div>
					<div class="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
						<span><strong class="text-foreground">"Start"</strong> — begin workout</span>
						<span><strong class="text-foreground">"Finish set"</strong> — complete a set</span>
						<span><strong class="text-foreground">"Reset"</strong> — reset reps</span>
						<span><strong class="text-foreground">"End workout"</strong> — finish session</span>
						<span><strong class="text-foreground">"Mute"</strong> — silence coach</span>
						<span><strong class="text-foreground">"Unmute"</strong> — enable coach</span>
					</div>
					<p class="mt-2 text-[10px] text-muted-foreground/70">
						Tap the mic button <LucideMic class="inline h-3 w-3" /> in the header to start listening.
					</p>
				</section>
			{/if}

			<div class="mt-auto">
				<Button class="w-full" size="lg" onclick={startWorkout}>
					<LucidePlay class="mr-2 h-5 w-5" />
					Start Workout
				</Button>
			</div>
		</div>
	{:else if completedWorkout}
		<!-- ── Workout Complete Summary ── -->
		<!-- Hidden form auto-submits to save the session to the DB -->
		<form
			method="POST"
			action="?/saveWorkout"
			use:enhance={() => {
				isSaving = true;
				return async ({ result, update }) => {
					workoutCompletionResult = result;
					isSaving = false;
					await update({ reset: false });
				};
			}}
			id="save-workout-form"
			class="hidden"
			use:autoSubmit
		>
			<input type="hidden" name="exercise" value={completedWorkout.exercise} />
			<input type="hidden" name="totalReps" value={completedWorkout.totalReps} />
			<input type="hidden" name="avgFormScore" value={completedWorkout.avgFormScore} />
			<input type="hidden" name="durationSeconds" value={completedWorkout.durationSeconds} />
		</form>

		<div class="flex flex-1 flex-col gap-6 overflow-y-auto p-4 pb-20">
			<!-- Trophy badge -->
			<div class="flex flex-col items-center gap-3 pt-6">
				{#if workoutCompletionResult?.data?.error}
					<div
						class="flex h-32 w-20 items-center justify-center rounded-full bg-destructive/15 shadow-lg shadow-destructive/20"
					>
						<span class="text-5xl">❗</span>
					</div>
					<div class="h-full text-center">
						<h2 class="text-2xl font-black">Your workout was not saved</h2>
						<p class="mt-1 text-sm text-muted-foreground">
							{getExerciseName(completedWorkout.exercise)} · {formatDuration(
								completedWorkout.durationSeconds
							)}
						</p>
						<p>{workoutCompletionResult?.data?.error}</p>
					</div>
				{:else}
					<div
						class="flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 shadow-lg shadow-primary/20"
					>
						<span class="text-5xl">🏆</span>
					</div>
					<div class="text-center">
						<h2 class="text-2xl font-black">Workout Complete!</h2>
						<p class="mt-1 text-sm text-muted-foreground">
							{getExerciseName(completedWorkout.exercise)} · {formatDuration(
								completedWorkout.durationSeconds
							)}
						</p>
						{#if isSaving}
							<p class="mt-1 animate-pulse text-xs text-primary">Saving to your records…</p>
						{:else}
							<p class="mt-1 flex items-center justify-center gap-1 text-xs text-emerald-500">
								<LucideCheck class="h-3 w-3" /> Saved
							</p>
						{/if}
					</div>
				{/if}
			</div>

			<!-- Stats grid -->
			{#if !workoutCompletionResult?.data?.error}
				<div class="grid grid-cols-3 gap-3">
					<div class="rounded-xl border border-border bg-card p-4 text-center">
						<p class="text-3xl font-black text-primary">{completedWorkout.totalReps}</p>
						<p class="mt-0.5 text-xs font-semibold text-muted-foreground">Total Reps</p>
					</div>
					<div class="rounded-xl border border-border bg-card p-4 text-center">
						<p
							class="text-3xl font-black {completedWorkout.avgFormScore >= 70
								? 'text-emerald-500'
								: 'text-amber-500'}"
						>
							{completedWorkout.avgFormScore}%
						</p>
						<p class="mt-0.5 text-xs font-semibold text-muted-foreground">Avg Form</p>
					</div>
					<div class="rounded-xl border border-border bg-card p-4 text-center">
						<p class="text-3xl font-black text-primary">{completedWorkout.sets.length}</p>
						<p class="mt-0.5 text-xs font-semibold text-muted-foreground">Sets</p>
					</div>
				</div>
			{/if}

			<!-- Sets breakdown -->
			{#if completedWorkout.sets.length > 0}
				<div class="rounded-xl border border-border bg-card p-4">
					<h3 class="mb-3 text-sm font-bold">Sets Breakdown</h3>
					<div class="space-y-2">
						{#each completedWorkout.sets as set, i (i)}
							<div class="flex items-center justify-between text-sm">
								<span class="font-medium text-muted-foreground">Set {i + 1}</span>
								<span class="font-bold">{set.reps} reps</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<div class="mt-auto flex gap-3">
				{#if !workoutCompletionResult?.data?.error}
					<Button variant="outline" class="flex-1" size="lg" href={resolve('/dashboard/reports')}>
						View Reports
					</Button>
				{/if}
				<Button class="flex-1" size="lg" onclick={resetToStart}>
					<LucidePlay class="mr-2 h-5 w-5" />
					New Workout
				</Button>
			</div>
		</div>
	{:else}
		<!-- Session layout: stacked on mobile, side-by-side on md+ -->
		<div
			class="session-layout flex flex-1 flex-col gap-3 overflow-hidden p-3 md:flex-row md:gap-4 md:p-4"
		>
			<!-- Camera feed -->
			<div
				class="session-camera relative max-h-[45vh] min-w-0 overflow-hidden rounded-2xl bg-black
				md:max-h-none md:flex-1"
			>
				<PoseDetector
					exercise={selectedExercise}
					onRepCount={handleRepCount}
					onFormFeedback={handleFormFeedback}
					onStateChange={handleStateChange}
					onSafetyAlert={handleSafetyAlert}
					badFormAlertDelay={SAFETY_ALERT_DELAY}
				/>

				{#if safetyAlertVisible}
					<div
						class="safety-alert-overlay absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-destructive/70 text-white backdrop-blur-sm"
					>
						<div
							class="safety-alert-icon rounded-full bg-destructive p-4 shadow-lg shadow-destructive/50"
						>
							<LucideShieldAlert class="h-10 w-10" />
						</div>
						<div class="px-6 text-center">
							<p class="text-xl font-black tracking-wide">Improper Form Detected</p>
							<p class="mt-1 text-sm font-medium text-white/90">
								Poor form detected for {SAFETY_ALERT_DELAY / 1000}+ seconds.<br />
								Adjust your posture to avoid injury!
							</p>
						</div>
						<button
							type="button"
							class="mt-1 rounded-full border border-white/40 bg-white/20 px-4 py-1.5 text-xs font-bold transition-all hover:bg-white/30 active:scale-95"
							onclick={() => (safetyAlertVisible = false)}
						>
							Dismiss
						</button>
					</div>
				{/if}

				<!-- Voice listening indicator overlaid on camera -->
				{#if voiceRecognitionActive}
					<div
						class="absolute right-3 bottom-3 z-10 flex items-center gap-1.5 rounded-full
						bg-rose-500/80 px-3 py-1 text-[10px] font-bold text-white backdrop-blur-sm"
					>
						<span class="h-1.5 w-1.5 animate-pulse rounded-full bg-white"></span>
						Listening
					</div>
				{/if}
			</div>

			<!-- Stats & controls — compact horizontal strip on mobile, vertical sidebar on md+ -->

			<!-- MOBILE: compact all-in-one bar -->
			<div class="flex shrink-0 flex-col gap-2 md:hidden">
				<!-- Top row: exercise name + state badge + feedback -->
				<div class="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
					<span class="text-xs font-bold">{getExerciseName(selectedExercise)}</span>
					<span
						class="rounded-full px-2 py-0.5 text-[10px] font-bold text-white {exerciseState ===
						'down'
							? 'bg-emerald-500'
							: exerciseState === 'up'
								? 'bg-blue-500'
								: 'bg-amber-500'}"
					>
						{exerciseState === 'down' ? 'Down' : exerciseState === 'up' ? 'Up' : 'Ready'}
					</span>
					<span class="ml-auto text-[10px] text-muted-foreground">{formFeedback.feedback}</span>
				</div>

				<!-- Middle row: reps + form score + sets summary -->
				<div class="grid grid-cols-3 gap-2">
					<div class="rounded-xl border border-border bg-card p-2 text-center">
						<p class="text-2xl font-black text-primary">{currentSetReps}</p>
						<p class="text-[10px] font-bold text-muted-foreground">Reps</p>
					</div>
					<div class="rounded-xl border border-border bg-card p-2 text-center">
						<p
							class="text-2xl font-black {formFeedback.score >= 70
								? 'text-emerald-500'
								: 'text-amber-500'}"
						>
							{formFeedback.score}%
						</p>
						<p class="text-[10px] font-bold text-muted-foreground">Form</p>
					</div>
					<div class="rounded-xl border border-border bg-card p-2 text-center">
						<p class="text-2xl font-black text-primary">{sets.length}</p>
						<p class="text-[10px] font-bold text-muted-foreground">Sets</p>
					</div>
				</div>

				<!-- Bottom row: action buttons -->
				<div class="grid grid-cols-3 gap-2">
					<Button
						variant="outline"
						size="sm"
						class="w-full text-xs"
						onclick={() => {
							currentSetReps = 0;
						}}
					>
						<LucideRotateCcw class="mr-1 h-3.5 w-3.5" />
						Reset
					</Button>
					<Button variant="secondary" size="sm" class="w-full text-xs" onclick={finishSet}>
						Finish Set
					</Button>
					<Button variant="destructive" size="sm" class="w-full text-xs" onclick={endWorkout}>
						End
					</Button>
				</div>
			</div>

			<!-- DESKTOP: vertical sidebar (hidden on mobile) -->
			<div class="hidden w-56 shrink-0 flex-col gap-3 overflow-y-auto md:flex">
				<!-- Exercise + state + feedback -->
				<div class="rounded-xl border border-border bg-card p-3">
					<div class="mb-2 flex items-center justify-between">
						<span class="text-sm font-bold">{getExerciseName(selectedExercise)}</span>
						<span
							class="rounded-full px-2 py-0.5 text-xs font-bold text-white {exerciseState === 'down'
								? 'bg-emerald-500'
								: exerciseState === 'up'
									? 'bg-blue-500'
									: 'bg-amber-500'}"
						>
							{exerciseState === 'down' ? 'Down' : exerciseState === 'up' ? 'Up' : 'Ready'}
						</span>
					</div>
					<p class="text-xs text-muted-foreground">{formFeedback.feedback}</p>
				</div>

				<!-- Rep + form score -->
				<div class="grid grid-cols-2 gap-2">
					<div class="rounded-xl border border-border bg-card p-3 text-center">
						<p class="text-3xl font-black text-primary">{currentSetReps}</p>
						<p class="text-[10px] font-bold text-muted-foreground">Reps</p>
					</div>
					<div class="rounded-xl border border-border bg-card p-3 text-center">
						<p
							class="text-3xl font-black {formFeedback.score >= 70
								? 'text-emerald-500'
								: 'text-amber-500'}"
						>
							{formFeedback.score}%
						</p>
						<p class="text-[10px] font-bold text-muted-foreground">Form</p>
					</div>
				</div>

				<!-- Voice status card -->
				<div class="rounded-xl border border-border bg-card p-3">
					<div class="mb-2 flex items-center justify-between">
						<span class="text-xs font-bold">Voice Assistant</span>
						{#if voiceRecognitionActive}
							<span
								class="flex items-center gap-1 rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold text-rose-500"
							>
								<span class="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500"></span>
								Listening
							</span>
						{/if}
					</div>
					<div class="flex gap-2">
						{#if voiceCoachSupported}
							<button
								type="button"
								title={voiceCoachEnabled ? 'Mute coach' : 'Enable coach'}
								class="flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-1.5 text-[10px] font-bold transition-all
									{voiceCoachEnabled
									? 'border-primary/40 bg-primary/10 text-primary hover:bg-primary/20'
									: 'border-border text-muted-foreground hover:border-primary/30'}"
								onclick={toggleVoiceCoach}
							>
								{#if voiceCoachEnabled}
									<LucideVolume2 class="h-3 w-3" />Coach On
								{:else}
									<LucideVolumeX class="h-3 w-3" />Coach Off
								{/if}
							</button>
						{/if}
						{#if voiceRecognitionSupported}
							<button
								type="button"
								title={voiceRecognitionActive ? 'Stop listening' : 'Start listening'}
								class="flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-1.5 text-[10px] font-bold transition-all
									{voiceRecognitionActive
									? 'border-rose-500/40 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20'
									: 'border-border text-muted-foreground hover:border-rose-500/30'}"
								onclick={toggleVoiceRecognition}
							>
								{#if voiceRecognitionActive}
									<LucideMic class="h-3 w-3" />Mic On
								{:else}
									<LucideMicOff class="h-3 w-3" />Mic Off
								{/if}
							</button>
						{/if}
					</div>

					<!-- Command hint -->
					<div class="mt-2 space-y-0.5 text-[9px] text-muted-foreground/70">
						<p>"Finish set" · "Reset" · "End workout"</p>
						<p>"Mute" · "Unmute"</p>
					</div>
				</div>

				<!-- Completed sets -->
				{#if sets.length > 0}
					<div class="rounded-xl border border-border bg-card p-3">
						<h3 class="mb-2 text-xs font-bold">Sets</h3>
						<div class="space-y-1.5">
							{#each sets as set, i (i)}
								<div class="flex items-center justify-between text-xs">
									<span class="font-medium text-muted-foreground">Set {i + 1}</span>
									<span class="font-bold">{set.reps} reps</span>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Controls pushed to bottom -->
				<div class="mt-auto flex flex-col gap-2">
					<Button
						variant="outline"
						class="w-full"
						size="sm"
						onclick={() => {
							currentSetReps = 0;
						}}
					>
						<LucideRotateCcw class="mr-1.5 h-4 w-4" />
						Reset Reps
					</Button>
					<Button variant="secondary" class="w-full" size="sm" onclick={finishSet}>
						Finish Set
					</Button>
					<Button variant="destructive" class="w-full" size="sm" onclick={endWorkout}>
						End Workout
					</Button>
				</div>
			</div>
		</div>
	{/if}
</div>
