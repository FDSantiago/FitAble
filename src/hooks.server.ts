import { type Handle } from '@sveltejs/kit';
import { building } from '$app/environment';
import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { sequence } from '@sveltejs/kit/hooks';

import { redirect as flashRedirect} from 'sveltekit-flash-message/server'

const handleBetterAuth: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({ headers: event.request.headers });

	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	}

	return svelteKitHandler({ event, resolve, auth, building });
};

export const handleProtectedRoute: Handle = async ({ event, resolve }) => {
	if (!event.route.id?.startsWith('/(protected)')) return resolve(event);
	if (event.locals.user) return resolve(event);

    // Redirect to login, optionally passing the intended URL to return to later
    flashRedirect(302, `/login?redirectTo=${event.url.pathname}`, { type: 'error', message: "Please log in to access this page." }, event.cookies);
};

export const handleDevelopmentRoute: Handle = async ({ event, resolve }) => {
	if (!event.route.id?.startsWith('/(development)')) return resolve(event);
	if (import.meta.env.DEV) return resolve(event);

    flashRedirect(302, `/`, { type: 'error', message: "This route is only available in development." }, event.cookies);
};

export const handle: Handle = sequence(
	handleBetterAuth,
	handleProtectedRoute
);
