import type { PageServerLoad, Actions } from './$types.js';
import { redirect, fail } from '@sveltejs/kit';
import { loadUserSettings, updateUserSettings } from '$lib/server/settings';
import { settingsConfig } from '$lib/config/settings';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		redirect(302, '/login');
	}

	const userId = event.locals.user.id;

	return {
		settings: await loadUserSettings(userId),
		config: settingsConfig
	};
};

export const actions: Actions = {
	updateSettings: async (event) => {
		if (!event.locals.user) {
			return fail(401, { message: 'Unauthorized' });
		}

		const userId = event.locals.user.id;
		const formData = await event.request.formData();

		await updateUserSettings(userId, formData);

		return { success: true };
	}
};
