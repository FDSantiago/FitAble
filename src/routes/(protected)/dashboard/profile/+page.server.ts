import type { PageServerLoad, Actions } from './$types.js';
import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { formSchema } from './schema';
import { db } from '$lib/server/db';
import { studentProfiles, workoutSessions, fitnessGoals } from '$lib/server/db/app.schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { auth } from '$lib/server/auth';
import { user } from '$lib/server/db/auth.schema';
import { z } from 'zod';

const emailChangeSchema = z.object({
	email: z.email('Invalid email address'),
	password: z.string().min(1, 'Password is required')
});

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		redirect(302, '/login');
	}

	const userId = event.locals.user.id;

	const profile = await db.query.studentProfiles.findFirst({
		where: eq(studentProfiles.userId, userId)
	});

	// --- Lifetime stats ---
	const lifetimeRows = await db
		.select({
			totalSessions: sql<number>`count(*)::int`,
			totalMinutes: sql<number>`coalesce(sum(${workoutSessions.durationMinutes}), 0)::int`
		})
		.from(workoutSessions)
		.where(eq(workoutSessions.userId, userId));

	const lifetimeTotalSessions = lifetimeRows[0]?.totalSessions ?? 0;
	const lifetimeTotalMinutes = lifetimeRows[0]?.totalMinutes ?? 0;

	// --- Current week's workout count ---
	const now = new Date();
	const dayOfWeek = now.getDay();
	const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
	const thisWeekStart = new Date(now);
	thisWeekStart.setDate(now.getDate() + diffToMonday);
	thisWeekStart.setHours(0, 0, 0, 0);

	const thisWeekRows = await db
		.select({ count: sql<number>`count(*)::int` })
		.from(workoutSessions)
		.where(
			and(eq(workoutSessions.userId, userId), gte(workoutSessions.sessionDateTime, thisWeekStart))
		);

	const thisWeekCount = thisWeekRows[0]?.count ?? 0;

	// Format total time for display
	function formatTotalTime(totalMins: number): string {
		if (totalMins < 60) return `${totalMins}m`;
		const hours = Math.floor(totalMins / 60);
		const mins = totalMins % 60;
		return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
	}

	// --- Active fitness goals with progress ---
	const activeGoals = await db.query.fitnessGoals.findMany({
		where: and(eq(fitnessGoals.userId, userId), eq(fitnessGoals.status, 'active'))
	});

	const activeGoalsWithProgress = await Promise.all(
		activeGoals.map(async (goal) => {
			const workoutsInPeriod = await db
				.select({ count: sql<number>`count(*)::int` })
				.from(workoutSessions)
				.where(
					and(
						eq(workoutSessions.userId, userId),
						gte(workoutSessions.sessionDateTime, goal.startDate),
						lte(workoutSessions.sessionDateTime, goal.endDate)
					)
				);

			const completedWorkouts = workoutsInPeriod[0]?.count ?? 0;
			const progress = Math.min(100, Math.round((completedWorkouts / goal.targetWorkouts) * 100));
			const daysLeft = Math.max(
				0,
				Math.ceil((new Date(goal.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
			);

			return {
				id: goal.id,
				title: goal.title,
				targetWorkouts: goal.targetWorkouts,
				daysDuration: goal.daysDuration,
				completedWorkouts,
				progress,
				daysLeft,
				startDate: goal.startDate.toISOString(),
				endDate: goal.endDate.toISOString()
			};
		})
	);

	return {
		form: await superValidate(zod4(formSchema)),
		profile: profile
			? {
					age: profile.age ?? undefined,
					weightKg: profile.weightKg ? Number(profile.weightKg) : undefined,
					heightCm: profile.heightCm ? Number(profile.heightCm) : undefined,
					fitnessLevel: profile.fitnessLevel ?? undefined,
					weeklyWorkoutGoal: profile.weeklyWorkoutGoal ?? 3
				}
			: null,
		stats: {
			totalWorkouts: lifetimeTotalSessions,
			timeTrained: formatTotalTime(lifetimeTotalMinutes),
			thisWeekCount
		},
		activeGoals: activeGoalsWithProgress
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

	updateName: async ({ request, locals }) => {
		if (!locals.user) {
			redirect(302, '/login');
		}

		const formData = await request.formData();
		const name = formData.get('name') as string | null;

		if (!name || name.trim().length === 0) {
			return fail(400, { error: 'Name is required' });
		}

		if (name.trim().length > 100) {
			return fail(400, { error: 'Name is too long' });
		}

		try {
			await auth.api.updateUser({
				body: {
					name: name.trim(),
					image: locals.user.image
				},
				headers: {
					cookie: request.headers.get('cookie') || ''
				}
			});
		} catch (err) {
			console.log(err);
			return fail(500, { error: 'Failed to update name' });
		}

		return { success: true };
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
	},

	updateEmail: async ({ request, locals }) => {
		if (!locals.user) {
			redirect(302, '/login');
		}

		const formData = await request.formData();
		const email = formData.get('email') as string | null;
		const password = formData.get('password') as string | null;

		const result = emailChangeSchema.safeParse({ email, password });
		if (!result.success) {
			return fail(400, { emailError: result.error.issues[0].message });
		}

		const existingUser = await db.query.user.findFirst({
			where: eq(user.id, locals.user.id)
		});

		if (!existingUser) {
			return fail(400, { emailError: 'User not found' });
		}

		if (existingUser.email === result.data.email) {
			return fail(400, { emailError: 'This is already your current email!' });
		}

		const emailTaken = await db.query.user.findFirst({
			where: eq(user.email, result.data.email)
		});

		if (emailTaken) {
			return {
				emailUpdateSuccess: true,
				message: 'If the address is valid, a verification email has been sent to your new email.'
			};
		}

		try {
			await auth.api.verifyPassword({
				body: {
					password: result.data.password
				},
				headers: {
					cookie: request.headers.get('cookie') || ''
				}
			});
		} catch (_err) {
			return fail(400, { emailError: 'Incorrect password' });
		}

		try {
			await db
				.update(user)
				.set({
					email: result.data.email,
					emailVerified: false,
					updatedAt: new Date()
				})
				.where(eq(user.id, locals.user.id));
		} catch (err) {
			console.error('Failed to update email:', err);
			return fail(500, { emailError: 'Failed to update email' });
		}

		try {
			auth.api.sendVerificationEmail({
				body: {
					email: result.data.email,
					callbackURL: '/dashboard/profile?email_verified=true'
				},
				headers: {
					cookie: request.headers.get('cookie') || ''
				}
			});
		} catch (err) {
			console.error('Failed to send verification email:', err);
		}

		return {
			emailUpdateSuccess: true,
			message: 'If the address is valid, a verification email has been sent to your new email.'
		};
	}
};
