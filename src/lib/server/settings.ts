import { settingsConfig } from '$lib/config/settings';
import { db } from '$lib/server/db';
import { userSettings } from '$lib/server/db/app.schema';
import { eq } from 'drizzle-orm';

export function getDefaults() {
	return Object.fromEntries(settingsConfig.map((s) => [s.key, s.default]));
}

export async function loadUserSettings(userId: string) {
	const existing = await db.query.userSettings.findFirst({
		where: eq(userSettings.userId, userId)
	});
	return existing ?? { userId, ...getDefaults() };
}

export async function updateUserSettings(userId: string, formData: FormData) {
	const values: Record<string, boolean | string> = { userId };

	for (const setting of settingsConfig) {
		if (setting.type === 'boolean') {
			values[setting.key] = formData.get(setting.key) === 'true';
		} else {
			values[setting.key] = (formData.get(setting.key) as string) ?? setting.default;
		}
	}

	await db.insert(userSettings).values(values).onConflictDoUpdate({
		target: userSettings.userId,
		set: values
	});
}
