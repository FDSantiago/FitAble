import type { PageServerLoad, Actions } from './$types.js';
import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { formSchema } from './schema';
import { db } from '$lib/server/db';
import { fitnessGoals, workoutSessions } from '$lib/server/db/app.schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { z } from 'zod';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		redirect(302, '/login');
	}

	const userId = event.locals.user.id;

	const goals = await db.query.fitnessGoals.findMany({
		where: eq(fitnessGoals.userId, userId),
		orderBy: (fitnessGoals, { desc }) => [desc(fitnessGoals.startDate)]
	});

	const goalsWithProgress = await Promise.all(
		goals.map(async (goal) => {
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
			const isExpired = new Date() > goal.endDate && goal.status === 'active';

			return {
				...goal,
				completedWorkouts,
				progress,
				isExpired,
				isCompleted: completedWorkouts >= goal.targetWorkouts
			};
		})
	);

	const activeGoals = goalsWithProgress.filter((g) => g.status === 'active');
	const completedGoals = goalsWithProgress.filter((g) => g.status === 'completed' || g.isCompleted);
	const pastGoals = goalsWithProgress.filter(
		(g) => g.status === 'cancelled' || (g.isExpired && !g.isCompleted)
	);

	return {
		form: await superValidate(zod4(formSchema)),
		goals: goalsWithProgress,
		activeGoals,
		completedGoals,
		pastGoals
	};
};

export const actions: Actions = {
	createGoal: async (event) => {
		if (!event.locals.user) {
			redirect(302, '/login');
		}

		const form = await superValidate(event, zod4(formSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		const userId = event.locals.user.id;
		const startDate = new Date();
		const endDate = new Date();
		endDate.setDate(startDate.getDate() + form.data.daysDuration);

		await db.insert(fitnessGoals).values({
			userId,
			title: form.data.title,
			targetWorkouts: form.data.targetWorkouts,
			daysDuration: form.data.daysDuration,
			startDate,
			endDate,
			status: 'active'
		});

		return { success: true, form };
	},

	cancelGoal: async ({ request, locals }) => {
		if (!locals.user) {
			redirect(302, '/login');
		}

		const formData = await request.formData();
		const goalId = formData.get('goalId') as string;

		if (!goalId) {
			return fail(400, { error: 'Goal ID is required' });
		}

		const goal = await db.query.fitnessGoals.findFirst({
			where: and(eq(fitnessGoals.id, goalId), eq(fitnessGoals.userId, locals.user.id))
		});

		if (!goal) {
			return fail(404, { error: 'Goal not found' });
		}

		await db
			.update(fitnessGoals)
			.set({ status: 'cancelled' })
			.where(and(eq(fitnessGoals.id, goalId), eq(fitnessGoals.userId, locals.user.id)));

		return { success: true };
	},

	completeGoal: async ({ request, locals }) => {
		if (!locals.user) {
			redirect(302, '/login');
		}

		const formData = await request.formData();
		const goalId = formData.get('goalId') as string;

		if (!goalId) {
			return fail(400, { error: 'Goal ID is required' });
		}

		const goal = await db.query.fitnessGoals.findFirst({
			where: and(eq(fitnessGoals.id, goalId), eq(fitnessGoals.userId, locals.user.id))
		});

		if (!goal) {
			return fail(404, { error: 'Goal not found' });
		}

		await db
			.update(fitnessGoals)
			.set({ status: 'completed' })
			.where(and(eq(fitnessGoals.id, goalId), eq(fitnessGoals.userId, locals.user.id)));

		return { success: true };
	}
};
