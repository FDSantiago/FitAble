import type { PageServerLoad } from './$types.js';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { workoutSessions, exercises } from '$lib/server/db/app.schema';
import { eq, desc } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		redirect(302, '/login');
	}

	const userId = event.locals.user.id;

	// Fetch all workout sessions with exercise names (most recent first)
	const sessions = await db
		.select({
			id: workoutSessions.id,
			exerciseName: exercises.exerciseName,
			sessionDateTime: workoutSessions.sessionDateTime,
			repsCompleted: workoutSessions.repsCompleted,
			averageFormScore: workoutSessions.averageFormScore,
			durationMinutes: workoutSessions.durationMinutes
		})
		.from(workoutSessions)
		.innerJoin(exercises, eq(workoutSessions.exerciseId, exercises.id))
		.where(eq(workoutSessions.userId, userId))
		.orderBy(desc(workoutSessions.sessionDateTime));

	// Compute overall average form score across all sessions
	const overallAvg =
		sessions.length > 0
			? sessions.reduce((sum, s) => sum + Number(s.averageFormScore), 0) / sessions.length
			: 0;

	// Compute month-over-month trend (last 7 months)
	const now = new Date();
	const monthlyData: { label: string; score: number | null }[] = [];

	for (let i = 6; i >= 0; i--) {
		const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
		const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
		const label = monthDate.toLocaleString('default', { month: 'short' });

		const monthSessions = sessions.filter((s) => {
			const d = new Date(s.sessionDateTime);
			return d >= monthDate && d < nextMonth;
		});

		monthlyData.push({
			label,
			score:
				monthSessions.length > 0
					? monthSessions.reduce((sum, s) => sum + Number(s.averageFormScore), 0) /
						monthSessions.length
					: null
		});
	}

	// Compute monthly increase vs previous month
	const currentMonthScore = monthlyData.at(-1)?.score ?? null;
	const prevMonthScore = monthlyData.at(-2)?.score ?? null;
	const monthlyChange =
		currentMonthScore !== null && prevMonthScore !== null
			? currentMonthScore - prevMonthScore
			: null;

	return {
		sessions: sessions.map((s) => ({
			id: s.id,
			exerciseName: s.exerciseName,
			sessionDateTime: s.sessionDateTime.toISOString(),
			repsCompleted: s.repsCompleted,
			averageFormScore: Number(s.averageFormScore),
			durationMinutes: s.durationMinutes
		})),
		overallAvgFormScore: Math.round(overallAvg * 10) / 10,
		monthlyData,
		monthlyChange: monthlyChange !== null ? Math.round(monthlyChange * 10) / 10 : null
	};
};
