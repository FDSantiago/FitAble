import type { PageServerLoad } from './$types.js';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import {
	workoutSessions,
	exercises,
	studentProfiles,
	fitnessGoals
} from '$lib/server/db/app.schema';
import { eq, desc, and, gte, lt, lte, sql } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		redirect(302, '/login');
	}

	const userId = event.locals.user.id;

	// --- Date ranges ---
	const now = new Date();

	// Start of the current week (Monday)
	const dayOfWeek = now.getDay(); // 0 = Sunday
	const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
	const thisWeekStart = new Date(now);
	thisWeekStart.setDate(now.getDate() + diffToMonday);
	thisWeekStart.setHours(0, 0, 0, 0);

	// Start of the previous week
	const lastWeekStart = new Date(thisWeekStart);
	lastWeekStart.setDate(thisWeekStart.getDate() - 7);

	// --- Fetch all sessions for this week ---
	const thisWeekSessions = await db
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
		.where(
			and(eq(workoutSessions.userId, userId), gte(workoutSessions.sessionDateTime, thisWeekStart))
		)
		.orderBy(desc(workoutSessions.sessionDateTime));

	// --- Fetch last week sessions (for comparison) ---
	const lastWeekSessions = await db
		.select({ averageFormScore: workoutSessions.averageFormScore })
		.from(workoutSessions)
		.where(
			and(
				eq(workoutSessions.userId, userId),
				gte(workoutSessions.sessionDateTime, lastWeekStart),
				lt(workoutSessions.sessionDateTime, thisWeekStart)
			)
		);

	// --- Compute weekly stats ---
	const weeklyWorkoutCount = thisWeekSessions.length;

	const thisWeekAvgForm =
		thisWeekSessions.length > 0
			? thisWeekSessions.reduce((sum, s) => sum + Number(s.averageFormScore), 0) /
				thisWeekSessions.length
			: null;

	const lastWeekAvgForm =
		lastWeekSessions.length > 0
			? lastWeekSessions.reduce((sum, s) => sum + Number(s.averageFormScore), 0) /
				lastWeekSessions.length
			: null;

	const formScoreChange =
		thisWeekAvgForm !== null && lastWeekAvgForm !== null
			? Math.round((thisWeekAvgForm - lastWeekAvgForm) * 10) / 10
			: null;

	// --- Recent activity (last 5 sessions across all time) ---
	const recentSessions = await db
		.select({
			id: workoutSessions.id,
			exerciseName: exercises.exerciseName,
			sessionDateTime: workoutSessions.sessionDateTime,
			averageFormScore: workoutSessions.averageFormScore,
			repsCompleted: workoutSessions.repsCompleted,
			durationMinutes: workoutSessions.durationMinutes
		})
		.from(workoutSessions)
		.innerJoin(exercises, eq(workoutSessions.exerciseId, exercises.id))
		.where(eq(workoutSessions.userId, userId))
		.orderBy(desc(workoutSessions.sessionDateTime))
		.limit(5);

	// --- Weekly workout goal from profile ---
	const profile = await db.query.studentProfiles.findFirst({
		where: eq(studentProfiles.userId, userId)
	});

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
		weeklyStats: {
			workoutCount: weeklyWorkoutCount,
			avgFormScore: thisWeekAvgForm !== null ? Math.round(thisWeekAvgForm * 10) / 10 : null,
			formScoreChange,
			weeklyGoal: profile?.weeklyWorkoutGoal ?? 3
		},
		recentSessions: recentSessions.map((s) => ({
			id: s.id,
			exerciseName: s.exerciseName,
			sessionDateTime: s.sessionDateTime.toISOString(),
			averageFormScore: Math.round(Number(s.averageFormScore)),
			repsCompleted: s.repsCompleted,
			durationMinutes: s.durationMinutes
		})),
		activeGoals: activeGoalsWithProgress
	};
};
