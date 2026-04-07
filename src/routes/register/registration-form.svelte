<script lang="ts">
	import * as Alert from '$lib/components/ui/alert/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	
	import { type Infer, superForm, type SuperValidated } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { formSchema, type FormSchema } from './schema';

	import LucideUserRound from '~icons/lucide/user-round';
	import LucideCircleCheck from '~icons/lucide/circle-check';
	import LucideCircleX from '~icons/lucide/circle-x';
	import LucideInfo from '~icons/lucide/info';
	import LucideLock from '~icons/lucide/lock';
	import LucideMail from '~icons/lucide/mail';
	import LucideTriangleAlert from '~icons/lucide/triangle-alert';

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
</script>

<form method="POST" use:enhance>
	{#if $message}
		<Alert.Root variant={$message.type} class="mt-2">
			{@const Icon = iconMap[$message.type as MessageType] || LucideInfo}
			<Icon class="size-4" />
			<Alert.Title>{$message.message.title}</Alert.Title>
			<Alert.Description>{$message.message.description}</Alert.Description>
		</Alert.Root>
	{/if}

	<Form.Field class="mt-4" {form} name="name">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Full Name</Form.Label>
				<InputGroup.Root>
					<InputGroup.Addon>
						<LucideUserRound />
					</InputGroup.Addon>
					<InputGroup.Input {...props} bind:value={$formData.name} placeholder="Juan Dela Cruz" />
				</InputGroup.Root>
			{/snippet}
		</Form.Control>
		<Form.Description></Form.Description>
		<Form.FieldErrors />
	</Form.Field>
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
		<Form.Description></Form.Description>
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
		<Form.Description>Make sure to use a secure password.</Form.Description>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Button class="mt-4 w-full">Submit</Form.Button>
</form>
