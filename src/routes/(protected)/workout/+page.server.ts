import type { Actions } from './$types.js';
import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { workoutSessions, exercises } from '$lib/server/db/app.schema';
import { eq } from 'drizzle-orm';

// Map the client-side exercise keys to the names stored in the exercises table
const EXERCISE_NAME_MAP: Record<string, string> = {
	pushup: 'Push-up',
	squat: 'Squat',
	situp: 'Sit-up',
	jumpingjack: 'Jumping Jack'
};

export const actions: Actions = {
	saveWorkout: async ({ request, locals }) => {
		if (!locals.user) {
			redirect(302, '/login');
		}

		const formData = await request.formData();

		const exerciseKey = formData.get('exercise') as string | null;
		const totalReps = Number(formData.get('totalReps'));
		const avgFormScore = Number(formData.get('avgFormScore'));
		const durationSeconds = Number(formData.get('durationSeconds'));

		// Basic validation
		if (!exerciseKey || isNaN(totalReps) || isNaN(avgFormScore) || isNaN(durationSeconds)) {
			return fail(400, { error: 'Invalid workout data.' });
		}

		if (totalReps <= 0) {
			return fail(400, { error: 'No reps recorded, workout not saved.' });
		}

		// Look up the exercise record (auto-create if it doesn't exist yet)
		const exerciseName = EXERCISE_NAME_MAP[exerciseKey] ?? exerciseKey;

		let exercise = await db.query.exercises.findFirst({
			where: eq(exercises.exerciseName, exerciseName)
		});

		if (!exercise) {
			const [inserted] = await db
				.insert(exercises)
				.values({ exerciseName })
				.onConflictDoNothing()
				.returning();

			// Re-query in case of concurrent insert hitting the unique constraint
			exercise = inserted ?? (await db.query.exercises.findFirst({
				where: eq(exercises.exerciseName, exerciseName)
			}));
		}

		if (!exercise) {
			return fail(500, { error: 'Could not resolve exercise record.' });
		}

		const durationMinutes = Math.max(1, Math.round(durationSeconds / 60));

		await db.insert(workoutSessions).values({
			userId: locals.user.id,
			exerciseId: exercise.id,
			repsCompleted: totalReps,
			averageFormScore: avgFormScore.toFixed(2),
			durationMinutes
		});

		return { success: true };
	}
};
