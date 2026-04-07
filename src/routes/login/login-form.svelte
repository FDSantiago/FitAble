<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import { formSchema, type FormSchema } from './schema';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { slide } from 'svelte/transition';

	import LucideMail from '~icons/lucide/mail';
	import LucideLock from '~icons/lucide/lock';
	import LucideCircleX from '~icons/lucide/circle-x';
	import LucideCircleCheck from '~icons/lucide/circle-check';
	import LucideInfo from '~icons/lucide/info';
	import LucideTriangleAlert from '~icons/lucide/triangle-alert';
	import * as Alert from '$lib/components/ui/alert/index.js';

	type MessageType = 'error' | 'success' | 'info' | 'warning';
	const iconMap: Record<MessageType, typeof LucideInfo> = {
		error: LucideCircleX,
		success: LucideCircleCheck,
		info: LucideInfo,
		warning: LucideTriangleAlert
	};

	let { data }: { data: { form: SuperValidated<Infer<FormSchema>> } } = $props();

	const form = superForm(data.form, {
		validators: zod4Client(formSchema)
	});

	const { form: formData, enhance, message } = form;
	const alertTitle = $derived(
		$message?.message.title?.trim() ? $message.message.title : $message?.message.description
	);
</script>

<form method="POST" use:enhance>
	{#if $message}
		<div transition:slide|local={{ duration: 100 }}>
			<Alert.Root variant={$message.type} class="mt-2">
			{@const Icon = iconMap[$message.type as MessageType] || LucideInfo}
			<Icon />
			<Alert.Title>{alertTitle}</Alert.Title>
			{#if $message.message.title?.trim()}
				<Alert.Description>{$message.message.description}</Alert.Description>
			{/if}
		</Alert.Root>
		</div>
	{/if}

	<Form.Field class="mt-4" {form} name="email">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Email</Form.Label>
				<InputGroup.Root>
					<InputGroup.Addon>
						<LucideMail />
					</InputGroup.Addon>
					<InputGroup.Input
						{...props}
						bind:value={$formData.email}
						placeholder="student@institution.com"
					/>
				</InputGroup.Root>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field class="mt-4" {form} name="password">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Password</Form.Label>
				<InputGroup.Root>
					<InputGroup.Addon>
						<LucideLock />
					</InputGroup.Addon>
					<InputGroup.Input {...props} bind:value={$formData.password} />
				</InputGroup.Root>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Button class="mt-4 w-full">Submit</Form.Button>
</form>
