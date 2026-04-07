import type { PageServerLoad } from './$types.js';
import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth.js';

export const load: PageServerLoad = async (event) => {
	await auth.api.signOut({
		headers: event.request.headers
	});
	throw redirect(302, '/login');
};
