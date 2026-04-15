<script lang="ts">
	import LucideTarget from '~icons/lucide/target';
	import LucidePlus from '~icons/lucide/plus';
	import LucideX from '~icons/lucide/x';
	import LucideCheck from '~icons/lucide/check';
	import LucideFlag from '~icons/lucide/flag';
	import LucideCalendar from '~icons/lucide/calendar';
	import LucideClock from '~icons/lucide/clock';
	import { Button } from '$lib/components/ui/button';
	import Input from '$lib/components/ui/input/input.svelte';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import * as Form from '$lib/components/ui/form';
	import { formSchema } from './schema';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';

	let { data } = $props();

	const form = superForm(data.form, {
		validators: zod4Client(formSchema)
	});

	const { form: formData, enhance: formEnhance } = form;

	let showCreateModal = $state(false);
	let isCreating = $state(false);

	let draftData = $state({
		title: '',
		targetWorkouts: '',
		daysDuration: ''
	});

	function formatDate(date: Date | string): string {
		return new Date(date).toLocaleDateString('default', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	function getDaysRemaining(endDate: Date | string): number {
		const now = new Date();
		const end = new Date(endDate);
		const diffTime = end.getTime() - now.getTime();
		return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
	}

	function getGoalStatus(goal: (typeof data.goals)[number]): { label: string; color: string } {
		if (goal.status === 'cancelled') {
			return { label: 'Cancelled', color: 'text-destructive' };
		}
		if (goal.status === 'completed' || goal.isCompleted) {
			return { label: 'Completed', color: 'text-primary' };
		}
		if (goal.isExpired) {
			return { label: 'Expired', color: 'text-destructive' };
		}
		const daysLeft = getDaysRemaining(goal.endDate);
		if (daysLeft === 0) {
			return { label: 'Last day!', color: 'text-amber-500' };
		}
		return { label: `${daysLeft} days left`, color: 'text-muted-foreground' };
	}

	$effect(() => {
		if (data.form?.message?.type === 'success') {
			toast.success('Goal created successfully');
			showCreateModal = false;
			draftData = { title: '', targetWorkouts: '', daysDuration: '' };
		}
	});
</script>

<div class="relative min-h-screen bg-background pb-24 text-foreground">
	<div class="px-4 py-6 sm:px-6 md:px-10 lg:px-16">
		<main class="mx-auto w-full max-w-7xl">
			<header class="mb-6 flex items-center justify-between pt-4 md:mb-8">
				<div>
					<h1 class="text-xl font-bold tracking-tight sm:text-2xl">Fitness Goals</h1>
					<p class="text-sm text-muted-foreground">Set and track your personal fitness goals</p>
				</div>
				<Button onclick={() => (showCreateModal = true)}>
					<LucidePlus class="mr-1 h-4 w-4" />
					New Goal
				</Button>
			</header>

			{#if data.activeGoals.length > 0}
				<section class="mb-8">
					<h2 class="mb-3 text-sm font-bold tracking-wider text-muted-foreground uppercase">
						Active Goals
					</h2>
					<div class="flex flex-col gap-4">
						{#each data.activeGoals as goal (goal.id)}
							{@const status = getGoalStatus(goal)}
							<div
								class="rounded-2xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
							>
								<div class="mb-3 flex items-start justify-between">
									<div class="flex items-center gap-3">
										<div
											class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
										>
											<LucideTarget class="h-5 w-5" />
										</div>
										<div>
											<h3 class="font-bold">{goal.title}</h3>
											<p class="text-xs text-muted-foreground">
												{goal.targetWorkouts} workouts in {goal.daysDuration} days
											</p>
										</div>
									</div>
									<div class="flex items-center gap-2">
										<span class="text-xs font-semibold {status.color}">{status.label}</span>
									</div>
								</div>

								<div class="mb-3 flex items-center gap-4 text-xs text-muted-foreground">
									<div class="flex items-center gap-1">
										<LucideCalendar class="h-3.5 w-3.5" />
										<span>{formatDate(goal.startDate)} - {formatDate(goal.endDate)}</span>
									</div>
								</div>

								<div class="mb-3 flex items-center justify-between">
									<span class="text-xs font-semibold text-muted-foreground">
										{goal.completedWorkouts}/{goal.targetWorkouts} workouts
									</span>
									<span class="text-xs font-bold text-primary">{goal.progress}%</span>
								</div>

								<div class="h-2 w-full overflow-hidden rounded-full bg-muted">
									<div
										class="h-full rounded-full bg-primary transition-all duration-500"
										style="width: {goal.progress}%"
									></div>
								</div>

								{#if goal.status === 'active' && !goal.isCompleted}
									<form
										method="POST"
										action="?/cancelGoal"
										use:enhance={() => {
											return async ({ result, update }) => {
												if (result.type === 'success') {
													toast.success('Goal cancelled');
													await invalidateAll();
												}
												await update();
											};
										}}
										class="mt-4 flex justify-end"
									>
										<input type="hidden" name="goalId" value={goal.id} />
										<Button
											type="submit"
											variant="ghost"
											size="sm"
											class="text-destructive hover:bg-destructive/10"
										>
											<LucideX class="mr-1 h-4 w-4" />
											Cancel Goal
										</Button>
									</form>
								{/if}
							</div>
						{/each}
					</div>
				</section>
			{:else}
				<div class="mb-8 rounded-2xl border border-dashed border-border bg-card p-8 text-center">
					<LucideTarget class="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
					<p class="font-semibold text-muted-foreground">No active goals</p>
					<p class="mt-1 text-sm text-muted-foreground/70">
						Create a goal to start tracking your fitness journey
					</p>
				</div>
			{/if}

			{#if data.completedGoals.length > 0}
				<section class="mb-8">
					<h2 class="mb-3 text-sm font-bold tracking-wider text-muted-foreground uppercase">
						Completed Goals
					</h2>
					<div class="flex flex-col gap-3">
						{#each data.completedGoals as goal (goal.id)}
							<div
								class="flex items-center justify-between rounded-xl border border-border bg-card p-4"
							>
								<div class="flex items-center gap-3">
									<div
										class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
									>
										<LucideFlag class="h-5 w-5" />
									</div>
									<div>
										<h3 class="font-semibold">{goal.title}</h3>
										<p class="text-xs text-muted-foreground">
											{goal.completedWorkouts}/{goal.targetWorkouts} workouts completed
										</p>
									</div>
								</div>
								<div class="flex items-center gap-1 text-primary">
									<LucideCheck class="h-4 w-4" />
									<span class="text-xs font-bold">Completed</span>
								</div>
							</div>
						{/each}
					</div>
				</section>
			{/if}

			{#if data.pastGoals.length > 0}
				<section>
					<h2 class="mb-3 text-sm font-bold tracking-wider text-muted-foreground uppercase">
						Past Goals
					</h2>
					<div class="flex flex-col gap-3">
						{#each data.pastGoals as goal (goal.id)}
							<div
								class="flex items-center justify-between rounded-xl border border-border bg-card p-4 opacity-60"
							>
								<div class="flex items-center gap-3">
									<div
										class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
									>
										<LucideClock class="h-5 w-5" />
									</div>
									<div>
										<h3 class="font-semibold line-through">{goal.title}</h3>
										<p class="text-xs text-muted-foreground">
											{goal.completedWorkouts}/{goal.targetWorkouts} workouts
										</p>
									</div>
								</div>
								<span class="text-xs font-semibold text-destructive">
									{goal.status === 'cancelled' ? 'Cancelled' : 'Expired'}
								</span>
							</div>
						{/each}
					</div>
				</section>
			{/if}
		</main>
	</div>
</div>

{#if showCreateModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
		<div class="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-lg font-bold">Create New Goal</h2>
				<button
					type="button"
					onclick={() => {
						showCreateModal = false;
						draftData = { title: '', targetWorkouts: '', daysDuration: '' };
					}}
					class="rounded-full p-1 transition-colors hover:bg-muted"
				>
					<LucideX class="h-5 w-5" />
				</button>
			</div>

			<p class="mb-4 text-sm text-muted-foreground">
				Set a personal fitness goal for a specific number of days. Track your progress as you work
				towards your target.
			</p>

			<form
				method="POST"
				action="?/createGoal"
				use:enhance={() => {
					isCreating = true;
					return async ({ result, update }) => {
						isCreating = false;
						if (result.type === 'failure') {
							toast.error('Please fix the errors');
						}
						await update();
					};
				}}
				class="space-y-4"
			>
				<Form.Field {form} name="title">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Goal Title</Form.Label>
							<Input
								type="text"
								placeholder="e.g., Build workout consistency"
								bind:value={draftData.title}
								{...props}
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="targetWorkouts">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Target Workouts</Form.Label>
							<Input
								type="number"
								min="1"
								placeholder="e.g., 20"
								bind:value={draftData.targetWorkouts}
								{...props}
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="daysDuration">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Duration (days)</Form.Label>
							<Input
								type="number"
								min="7"
								max="365"
								placeholder="e.g., 30"
								bind:value={draftData.daysDuration}
								{...props}
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<div class="flex justify-end gap-2 pt-2">
					<Button
						type="button"
						variant="outline"
						onclick={() => {
							showCreateModal = false;
							draftData = { title: '', targetWorkouts: '', daysDuration: '' };
						}}
					>
						Cancel
					</Button>
					<Button type="submit" disabled={isCreating}>
						{isCreating ? 'Creating...' : 'Create Goal'}
					</Button>
				</div>
			</form>
		</div>
	</div>
{/if}
