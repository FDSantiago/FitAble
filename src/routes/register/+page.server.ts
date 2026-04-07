import type { PageServerLoad, Actions } from './$types.js';
import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { formSchema } from './schema';
import { auth } from '$lib/server/auth.js';
import { APIError } from 'better-auth';

export const load: PageServerLoad = async (event) => {
	// Redirect to dashboard if already logged in
	if (event.locals.user) {
		throw redirect(302, '/dashboard');
	}

	return {
		form: await superValidate(zod4(formSchema))
	};
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod4(formSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		// Registration
		try {
			await auth.api.signUpEmail({
				body: {
					name: form.data.name,
					email: form.data.email,
					password: form.data.password,
					callbackURL: "/login"
				},
				headers: event.request.headers
			});
		} catch (error: unknown) {
			if (!(error instanceof APIError)) {
				console.log('Unexpected error during registration: ', error);
				const errorMessage = 'An unexpected server error occurred. Please try again later.';
				form.message = { type: 'error', message: { title: errorMessage } };
				return fail(500, { form, message: errorMessage });
			}

			if (error.body?.code !== 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL') {
				console.error('API Error during registration:', error.body);
				const errorMessage = error.body?.message || 'Registration failed. Please try again later.';
				form.message = { type: 'error', message: { title: errorMessage } };
				return fail(400, { form, message: errorMessage });
			} else {
				console.log(`Someone tried to register with an existing email: ${form.data.email}`)
			}
		}

		const successMessage = 'Thanks for signing up! Please check your email to verify your account.';
		form.message = { type: 'success', message: { title: successMessage } };
		return {
			form,
			message: successMessage
		};
	}
};
