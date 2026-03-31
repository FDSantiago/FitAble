<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import { formSchema, type FormSchema } from './schema';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';

	import LucideMail from '~icons/lucide/mail';
	import LucideLock from '~icons/lucide/lock';

	let { data }: { data: { form: SuperValidated<Infer<FormSchema>> } } = $props();

	const form = superForm(data.form, {
		validators: zod4Client(formSchema)
	});

	const { form: formData, enhance } = form;
</script>

<form method="POST" use:enhance >
	
	<Form.Field class="mt-4" {form} name="email">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Email</Form.Label>
				<InputGroup.Root>
					<InputGroup.Addon>
						<LucideMail />
					</InputGroup.Addon>
					<InputGroup.Input {...props} bind:value={$formData.email} placeholder="student@institution.com" />
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
