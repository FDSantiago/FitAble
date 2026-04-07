import type { PageServerLoad, Actions } from './$types.js';
import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { formSchema } from './schema';
import { auth } from '$lib/server/auth.js';
import { APIError } from 'better-auth';

const USER_FACING_ERROR_MESSAGES: Record<string, string> = {
	INVALID_EMAIL_OR_PASSWORD: 'The email or password you entered is incorrect.',
};

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

		try {
			await auth.api.signInEmail({
				body: {
					email: form.data.email,
					password: form.data.password
				},
				headers: event.request.headers
			});
		} catch (error) {
			if (!(error instanceof APIError)) {
				console.error('Unexpected error during login:', error);
				const errorMessage = 'An unexpected server error occurred. Please try again later.';
				form.message = { type: 'error', message: { title: errorMessage } };
				return fail(500, {
					form,
					message: errorMessage
				});
			}

			console.error('Login error:', error);
			const errorMessage = USER_FACING_ERROR_MESSAGES[error.body?.code ?? ""] || error.message || 'An unknown error occurred';
			form.message = { type: 'error', message: { title: errorMessage } };
			return fail(400, {
				form,
				message: errorMessage
			});
		}

		// Check if there's a redirectTo parameter
		const url = new URL(event.request.url);
		const redirectTo = url.searchParams.get('redirectTo') || '/dashboard';
		throw redirect(302, redirectTo);
	}
};
