import type { PageServerLoad, Actions } from './$types.js';
import { redirect, fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { userSettings } from '$lib/server/db/app.schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		redirect(302, '/login');
	}

	const userId = event.locals.user.id;

	// Try to load existing settings; fall back to defaults
	const existing = await db.query.userSettings.findFirst({
		where: eq(userSettings.userId, userId)
	});

	return {
		settings: existing ?? {
			userId,
			realTimeVoiceAlerts: true,
			realTimeFormCorrection: true,
			gestureAutoCounting: true,
			defaultCamera: 'Front Camera' as string
		}
	};
};

export const actions: Actions = {
	updateSettings: async (event) => {
		if (!event.locals.user) {
			return fail(401, { message: 'Unauthorized' });
		}

		const userId = event.locals.user.id;
		const formData = await event.request.formData();

		const realTimeVoiceAlerts = formData.get('realTimeVoiceAlerts') === 'true';
		const realTimeFormCorrection = formData.get('realTimeFormCorrection') === 'true';
		const gestureAutoCounting = formData.get('gestureAutoCounting') === 'true';
		const defaultCamera = (formData.get('defaultCamera') as string) ?? 'Front Camera';

		await db
			.insert(userSettings)
			.values({
				userId,
				realTimeVoiceAlerts,
				realTimeFormCorrection,
				gestureAutoCounting,
				defaultCamera
			})
			.onConflictDoUpdate({
				target: userSettings.userId,
				set: {
					realTimeVoiceAlerts,
					realTimeFormCorrection,
					gestureAutoCounting,
					defaultCamera
				}
			});

		return { success: true };
	}
};
