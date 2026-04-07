<script lang="ts">
	import { resolve } from '$app/paths';
	import LucideUser from '~icons/lucide/user';
	import LucidePencil from '~icons/lucide/pencil';
	import LucideTarget from '~icons/lucide/target';
	import LucideLogOut from '~icons/lucide/log-out';
	import LucideCamera from '~icons/lucide/camera';
	import { Button } from '$lib/components/ui/button';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';

	let { data, form } = $props();

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

	let uploading = $state(false);
	let previewUrl = $state<string | null>(null);
	let fileInput: HTMLInputElement;

	function handleFileSelect(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			previewUrl = URL.createObjectURL(file);
		}
	}

	function triggerFileInput() {
		fileInput?.click();
	}
</script>

<div class="relative min-h-screen bg-background pb-24 text-foreground">
	<div class="px-4 py-6 sm:px-6 md:px-10 lg:px-16">
		<main class="mx-auto w-full max-w-7xl">
			<header class="mb-6 flex items-center justify-between pt-4 md:mb-8">
				<h1 class="text-xl font-bold tracking-tight sm:text-2xl">Student Profile</h1>
				<Button
					variant="ghost"
					size="icon"
					class="h-10 w-10 rounded-full hover:bg-muted"
					onclick={triggerFileInput}
				>
					<LucidePencil class="h-5 w-5 text-primary" />
				</Button>
			</header>

			<form
				method="POST"
				action="?/updateAvatar"
				enctype="multipart/form-data"
				use:enhance={() => {
					uploading = true;
					return async ({ result, update }) => {
						uploading = false;
						if (result.type === 'success') {
							previewUrl = null;
							await invalidateAll();
						} else {
							await update();
						}
					};
				}}
			>
				<input
					type="file"
					name="avatar"
					accept="image/jpeg,image/png,image/webp,image/gif"
					class="hidden"
					bind:this={fileInput}
					onchange={handleFileSelect}
				/>

				<div class="mb-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
					<div class="flex flex-col items-center text-center">
						<div class="group relative mb-4">
							{#if data.user.image || previewUrl}
								<img
									src={previewUrl || data.user.image}
									alt={user.name}
									class="h-20 w-20 rounded-full object-cover"
								/>
							{:else}
								<div
									class="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary"
								>
									<LucideUser class="h-10 w-10" />
								</div>
							{/if}
							<button
								type="button"
								onclick={triggerFileInput}
								class="absolute right-0 bottom-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
								disabled={uploading}
							>
								<LucideCamera class="h-4 w-4" />
							</button>
						</div>

						{#if previewUrl}
							<div class="mt-4 flex gap-2">
								<Button type="submit" size="sm" disabled={uploading}>
									{uploading ? 'Uploading...' : 'Save Photo'}
								</Button>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onclick={() => {
										previewUrl = null;
									}}
								>
									Cancel
								</Button>
							</div>
						{/if}

						{#if form?.error}
							<p class="mt-2 text-sm text-destructive">{form.error}</p>
						{/if}

						<h2 class="text-lg font-bold sm:text-xl">{user.name}</h2>
						<p class="text-sm text-muted-foreground">{user.course}</p>
						<div class="mt-3 inline-flex items-center rounded-full bg-primary/10 px-3 py-1">
							<span class="text-xs font-medium text-primary">{user.id}</span>
						</div>
					</div>
				</div>
			</form>

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
				<a href={resolve('/logout')} class="font-semibold">Log Out of Account</a>
			</Button>
		</main>
	</div>
</div>
