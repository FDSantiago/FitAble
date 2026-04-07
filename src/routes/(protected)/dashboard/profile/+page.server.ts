import type { PageServerLoad, Actions } from './$types.js';
import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { formSchema } from './schema';
import { db } from '$lib/server/db';
import { studentProfiles } from '$lib/server/db/app.schema';
import { eq } from 'drizzle-orm';
import { auth } from '$lib/server/auth';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		redirect(302, '/login');
	}

	const profile = await db.query.studentProfiles.findFirst({
		where: eq(studentProfiles.userId, event.locals.user.id)
	});

	return {
		form: await superValidate(zod4(formSchema)),
		profile: profile
			? {
					age: profile.age ?? undefined,
					weightKg: profile.weightKg ? Number(profile.weightKg) : undefined,
					heightCm: profile.heightCm ? Number(profile.heightCm) : undefined,
					fitnessLevel: profile.fitnessLevel ?? undefined,
					weeklyWorkoutGoal: profile.weeklyWorkoutGoal ?? undefined
				}
			: null
	};
};

export const actions: Actions = {
	updateProfile: async (event) => {
		if (!event.locals.user) {
			redirect(302, '/login');
		}

		const form = await superValidate(event, zod4(formSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		const existingProfile = await db.query.studentProfiles.findFirst({
			where: eq(studentProfiles.userId, event.locals.user.id)
		});

		if (existingProfile) {
			await db
				.update(studentProfiles)
				.set({
					age: form.data.age ?? null,
					weightKg: form.data.weightKg?.toString() ?? null,
					heightCm: form.data.heightCm?.toString() ?? null,
					fitnessLevel: form.data.fitnessLevel ?? null,
					weeklyWorkoutGoal: form.data.weeklyWorkoutGoal ?? null
				})
				.where(eq(studentProfiles.userId, event.locals.user.id));
		} else {
			await db.insert(studentProfiles).values({
				userId: event.locals.user.id,
				studentIdNumber: event.locals.user.email.split('@')[0],
				age: form.data.age ?? null,
				weightKg: form.data.weightKg?.toString() ?? null,
				heightCm: form.data.heightCm?.toString() ?? null,
				fitnessLevel: form.data.fitnessLevel ?? null,
				weeklyWorkoutGoal: form.data.weeklyWorkoutGoal ?? 3
			});
		}

		return { success: true, form };
	},

	updateAvatar: async ({ request, locals }) => {
		if (!locals.user) {
			redirect(302, '/login');
		}

		const formData = await request.formData();
		const file = formData.get('avatar') as File | null;

		if (!file || file.size === 0) {
			return fail(400, { error: 'No file provided' });
		}

		const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
		if (!allowedTypes.includes(file.type)) {
			return fail(400, { error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF' });
		}

		const maxSize = 5 * 1024 * 1024;
		if (file.size > maxSize) {
			return fail(400, { error: 'File too large. Maximum size is 5MB' });
		}

		const buffer = await file.arrayBuffer();
		const base64 = Buffer.from(buffer).toString('base64');
		const dataUrl = `data:${file.type};base64,${base64}`;

		try {
			await auth.api.updateUser({
				body: {
					name: locals.user.name,
					image: dataUrl
				},
				headers: {
					cookie: request.headers.get('cookie') || ''
				}
			});
		} catch (err) {
			console.log(err);
		}

		return { success: true };
	}
};
