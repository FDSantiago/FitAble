<script lang="ts">
	import { resolve } from '$app/paths';
	import LucideUser from '~icons/lucide/user';
	import LucidePencil from '~icons/lucide/pencil';
	import LucideTarget from '~icons/lucide/target';
	import LucideLogOut from '~icons/lucide/log-out';
	import LucideCamera from '~icons/lucide/camera';
	import LucideCheck from '~icons/lucide/check';
	import LucideX from '~icons/lucide/x';
	import LucideMail from '~icons/lucide/mail';
	import LucideShieldCheck from '~icons/lucide/shield-check';
	import { Button } from '$lib/components/ui/button';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import * as Form from '$lib/components/ui/form';
	import { formSchema } from './schema';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import CropModal from '$lib/components/crop-modal/crop-modal.svelte';
	import { scale } from 'svelte/transition';

	let { data } = $props();

	const form = superForm(data.form, {
		validators: zod4Client(formSchema)
	});

	const { form: formData, enhance: formEnhance } = form;

	let uploading = $state(false);
	let previewUrl = $state<string | null>(null);
	let croppedUrl = $state<string | null>(null);
	let croppedBlob = $state<Blob | null>(null);
	let fileInput: HTMLInputElement;
	let isEditing = $state(false);
	let showCropper = $state(false);
	let isEditingEmail = $state(false);
	let showEmailModal = $state(false);
	let newEmail = $state('');
	let emailPassword = $state('');
	let emailError = $state<string | null>(null);
	let draftData = $state({
		age: data.profile?.age ?? '',
		fitnessLevel: data.profile?.fitnessLevel ?? '',
		weightKg: data.profile?.weightKg ?? '',
		heightCm: data.profile?.heightCm ?? ''
	});

	const user = {
		name: data.user.name,
		course: undefined as string | undefined,
		id: data.user.email
	};

	const computedProfile = $derived({
		weight: data.profile?.weightKg ?? null,
		height: data.profile?.heightCm ?? null,
		age: data.profile?.age ?? null,
		fitnessLevel: data.profile?.fitnessLevel ?? null
	});

	const bmi = $derived(() => {
		if (!computedProfile.weight || !computedProfile.height) return null;
		const heightInM = computedProfile.height / 100;
		return (computedProfile.weight / (heightInM * heightInM)).toFixed(1);
	});

	const bmiStatus = $derived(() => {
		const bmiVal = bmi();
		if (!bmiVal) return null;
		const bmiNum = parseFloat(bmiVal);
		if (bmiNum < 18.5) return 'UNDERWEIGHT';
		if (bmiNum < 25) return 'NORMAL';
		if (bmiNum < 30) return 'OVERWEIGHT';
		return 'OBESE';
	});

	const goals = $derived({
		title: `Workout ${data.profile?.weeklyWorkoutGoal ?? 3}x a Week`,
		progress: data.stats.thisWeekCount,
		target: data.profile?.weeklyWorkoutGoal ?? 3
	});

	const stats = $derived({
		totalWorkouts: data.stats.totalWorkouts,
		timeTrained: data.stats.timeTrained
	});

	function handleFileSelect(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			croppedUrl = URL.createObjectURL(file);
			showCropper = true;
		}
	}

	function triggerFileInput() {
		fileInput?.click();
	}

	function handleCropComplete(blob: Blob) {
		croppedBlob = blob;
		previewUrl = URL.createObjectURL(blob);
		showCropper = false;
	}

	$effect(() => {
		if (data.form?.message?.type === 'success') {
			toast.success('Profile updated successfully');
			isEditing = false;
		}
	});
</script>

<div class="relative min-h-screen bg-background pb-24 text-foreground">
	<div class="px-4 py-6 sm:px-6 md:px-10 lg:px-16">
		<main class="mx-auto w-full max-w-7xl">
			<header class="mb-6 flex items-center justify-between pt-4 md:mb-8">
				<h1 class="text-xl font-bold tracking-tight sm:text-2xl">Student Profile</h1>
				<div class="flex gap-2">
					{#if !isEditing}
						<Button
							variant="outline"
							size="sm"
							onclick={() => {
								isEditing = true;
								draftData = {
									age: data.profile?.age ?? '',
									fitnessLevel: data.profile?.fitnessLevel ?? '',
									weightKg: data.profile?.weightKg ?? '',
									heightCm: data.profile?.heightCm ?? ''
								};
							}}
						>
							<LucidePencil class="mr-1 h-4 w-4" />
							Edit Profile
						</Button>
					{:else}
						<Button
							variant="ghost"
							size="sm"
							onclick={() => {
								isEditing = false;
								draftData = {
									age: data.profile?.age ?? '',
									fitnessLevel: data.profile?.fitnessLevel ?? '',
									weightKg: data.profile?.weightKg ?? '',
									heightCm: data.profile?.heightCm ?? ''
								};
							}}
						>
							<LucideX class="mr-1 h-4 w-4" />
							Cancel
						</Button>
					{/if}
				</div>
			</header>

			<form
				method="POST"
				action="?/updateAvatar"
				enctype="multipart/form-data"
				use:enhance={({ formData }) => {
					uploading = true;
					if (croppedBlob) {
						formData.set('avatar', croppedBlob, 'avatar.jpg');
					}
					return async ({ result, update }) => {
						uploading = false;
						if (result.type === 'success') {
							previewUrl = null;
							croppedUrl = null;
							croppedBlob = null;
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
							{#if isEditing}
								<button
									type="button"
									onclick={triggerFileInput}
									class="absolute right-0 bottom-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
									disabled={uploading}
								>
									<LucideCamera class="h-4 w-4" />
								</button>
							{/if}
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
										croppedUrl = null;
										croppedBlob = null;
									}}
								>
									Cancel
								</Button>
							</div>
						{/if}

						{#if isEditing}
							<form
								method="POST"
								action="?/updateName"
								use:enhance={() => {
									return async ({ result, update }) => {
										if (result.type === 'success') {
											await invalidateAll();
											toast.success('Name updated successfully');
										}
										await update();
									};
								}}
								class="mt-3 flex w-full max-w-48 gap-2"
							>
								<input
									type="text"
									name="name"
									value={user.name}
									placeholder="Enter your name"
									maxlength="100"
									class="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
								/>
								<Button type="submit" size="sm" class="shrink-0">
									<LucideCheck class="h-4 w-4" />
								</Button>
							</form>
						{:else}
							<h2 class="text-lg font-bold sm:text-xl">{user.name}</h2>
						{/if}
						<p class="text-sm text-muted-foreground">{user.course}</p>
						<div class="mt-3 inline-flex items-center rounded-full bg-primary/10 px-3 py-1">
							<LucideMail class="mr-1.5 h-3.5 w-3.5 text-primary" />
							<span class="text-xs font-medium text-primary">{user.id}</span>
							{#if isEditing}
								<button
									type="button"
									onclick={() => {
										showEmailModal = true;
									}}
									class="ml-1.5 rounded-full p-0.5 transition-colors hover:bg-primary/20"
								>
									<LucidePencil class="h-3 w-3 text-primary" />
								</button>
							{/if}
						</div>
						{#if !data.user.emailVerified}
							<div class="mt-2 flex items-center gap-1.5 text-xs text-amber-500">
								<LucideShieldCheck class="h-3.5 w-3.5" />
								<span>Email not verified</span>
							</div>
						{/if}
					</div>
				</div>
			</form>

			{#if isEditing}
				<form method="POST" action="?/updateProfile" use:formEnhance>
					<div class="mb-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
						<h3 class="mb-4 text-sm font-bold text-foreground">Personal Information</h3>

						<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<Form.Field {form} name="age">
								<Form.Control>
									{#snippet children({ props })}
										<Form.Label>Age</Form.Label>
										<input
											type="number"
											min="1"
											max="120"
											placeholder="Enter your age"
											class="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
											bind:value={draftData.age}
											{...props}
										/>
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>

							<Form.Field {form} name="fitnessLevel">
								<Form.Control>
									{#snippet children({ props })}
										<Form.Label>Fitness Level</Form.Label>
										<select
											class="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
											bind:value={draftData.fitnessLevel}
											{...props}
										>
											<option value="">Select fitness level</option>
											<option value="beginner">Beginner</option>
											<option value="intermediate">Intermediate</option>
											<option value="advanced">Advanced</option>
										</select>
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>

							<Form.Field {form} name="weightKg">
								<Form.Control>
									{#snippet children({ props })}
										<Form.Label>Weight (kg)</Form.Label>
										<input
											type="number"
											step="0.1"
											min="1"
											max="500"
											placeholder="Enter weight in kg"
											class="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
											bind:value={draftData.weightKg}
											{...props}
										/>
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>

							<Form.Field {form} name="heightCm">
								<Form.Control>
									{#snippet children({ props })}
										<Form.Label>Height (cm)</Form.Label>
										<input
											type="number"
											min="1"
											max="300"
											placeholder="Enter height in cm"
											class="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
											bind:value={draftData.heightCm}
											{...props}
										/>
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>
						</div>

						<div class="mt-6 flex justify-end gap-2">
							<Button
								type="button"
								variant="outline"
								onclick={() => {
									isEditing = false;
									draftData = {
										age: data.profile?.age ?? '',
										fitnessLevel: data.profile?.fitnessLevel ?? '',
										weightKg: data.profile?.weightKg ?? '',
										heightCm: data.profile?.heightCm ?? ''
									};
								}}
							>
								Cancel
							</Button>
							<Button
								onclick={() => {
									$formData.age = draftData.age ? Number(draftData.age) : undefined;
									$formData.fitnessLevel = draftData.fitnessLevel as
										| 'beginner'
										| 'intermediate'
										| 'advanced'
										| undefined;
									$formData.weightKg = draftData.weightKg ? Number(draftData.weightKg) : undefined;
									$formData.heightCm = draftData.heightCm ? Number(draftData.heightCm) : undefined;
									form.submit();
									isEditing = false;
								}}
							>
								<LucideCheck class="mr-1 h-4 w-4" />
								Save Changes
							</Button>
						</div>
					</div>
				</form>
			{:else}
				<section class="mb-6">
					<h3 class="mb-3 text-sm font-bold text-foreground">Body Metrics</h3>
					<div class="grid grid-cols-3 gap-3">
						<div class="rounded-xl border border-border bg-card p-4 text-center shadow-sm">
							<p class="mb-1 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
								Weight
							</p>
							<p class="text-lg font-bold">
								{computedProfile.weight ?? '--'}<span
									class="text-xs font-normal text-muted-foreground">kg</span
								>
							</p>
						</div>
						<div class="rounded-xl border border-border bg-card p-4 text-center shadow-sm">
							<p class="mb-1 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
								Height
							</p>
							<p class="text-lg font-bold">
								{computedProfile.height ?? '--'}<span
									class="text-xs font-normal text-muted-foreground">cm</span
								>
							</p>
						</div>
						<div class="rounded-xl border border-border bg-card p-4 text-center shadow-sm">
							<p class="mb-1 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
								BMI
							</p>
							<p class="text-lg font-bold">{bmi() ?? '--'}</p>
							{#if bmiStatus()}
								<p class="text-[10px] font-bold text-primary">{bmiStatus()}</p>
							{/if}
						</div>
					</div>
				</section>

				{#if computedProfile.age || computedProfile.fitnessLevel}
					<section class="mb-6">
						<h3 class="mb-3 text-sm font-bold text-foreground">Fitness Info</h3>
						<div class="grid grid-cols-2 gap-3">
							{#if computedProfile.age}
								<div class="rounded-xl border border-border bg-card p-4 text-center shadow-sm">
									<p
										class="mb-1 text-[10px] font-bold tracking-wider text-muted-foreground uppercase"
									>
										Age
									</p>
									<p class="text-lg font-bold">{computedProfile.age}</p>
								</div>
							{/if}
							{#if computedProfile.fitnessLevel}
								<div class="rounded-xl border border-border bg-card p-4 text-center shadow-sm">
									<p
										class="mb-1 text-[10px] font-bold tracking-wider text-muted-foreground uppercase"
									>
										Fitness Level
									</p>
									<p class="text-lg font-bold capitalize">{computedProfile.fitnessLevel}</p>
								</div>
							{/if}
						</div>
					</section>
				{/if}
			{/if}

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

{#if showEmailModal}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
	>
		<div class="mx-4 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-lg font-bold">Change Email Address</h2>
				<button
					type="button"
					onclick={() => {
						showEmailModal = false;
						newEmail = '';
						emailPassword = '';
						emailError = null;
					}}
					class="rounded-full p-1 transition-colors hover:bg-muted"
				>
					<LucideX class="h-5 w-5" />
				</button>
			</div>

			<p class="mb-4 text-sm text-muted-foreground">
				To change your email, please enter your new email address and your current password for
				verification.
			</p>

			<form
				method="POST"
				action="?/updateEmail"
				use:enhance={() => {
					return async ({ result, update }) => {
						if (result.type === 'success' && result.data?.emailUpdateSuccess) {
							toast.success('Verification email sent! Please check your new email.');
							showEmailModal = false;
							newEmail = '';
							emailPassword = '';
							emailError = null;
							await invalidateAll();
						} else if (result.type === 'failure' && result.data?.emailError) {
							emailError = result.data.emailError as string;
						}
						await update();
					};
				}}
				class="space-y-4"
			>
				<div class="space-y-2">
					<label for="newEmail" class="text-sm font-medium">New Email Address</label>
					<input
						type="email"
						id="newEmail"
						name="email"
						bind:value={newEmail}
						placeholder="Enter your new email"
						required
						class="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
					/>
				</div>

				<div class="space-y-2">
					<label for="emailPassword" class="text-sm font-medium">Current Password</label>
					<input
						type="password"
						id="emailPassword"
						name="password"
						bind:value={emailPassword}
						placeholder="Enter your current password"
						required
						class="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
					/>
				</div>

				{#if emailError}
					<p class="text-sm text-destructive">{emailError}</p>
				{/if}

				<div class="flex justify-end gap-2">
					<Button
						type="button"
						variant="outline"
						onclick={() => {
							showEmailModal = false;
							newEmail = '';
							emailPassword = '';
							emailError = null;
						}}
					>
						Cancel
					</Button>
					<Button type="submit">Change Email</Button>
				</div>
			</form>
		</div>
	</div>
{/if}

{#if showCropper && croppedUrl}
	<CropModal
		src={croppedUrl}
		onclose={() => {
			showCropper = false;
			croppedUrl = null;
		}}
		oncrop={handleCropComplete}
	/>
{/if}
