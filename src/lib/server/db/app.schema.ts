// src/db/schema/app.ts
import {
	pgTable,
	text,
	varchar,
	decimal,
	integer,
	timestamp,
	boolean,
	serial
} from 'drizzle-orm/pg-core';
import { user } from './auth.schema'; // Import auth user for foreign keys

// --- LOOKUP TABLES ---

export const programs = pgTable('programs', {
	id: serial('id').primaryKey(),
	programName: varchar('program_name', { length: 255 }).notNull().unique()
});

export const exercises = pgTable('exercises', {
	id: serial('id').primaryKey(),
	exerciseName: varchar('exercise_name', { length: 100 }).notNull().unique()
});

// --- FITABLE DOMAIN TABLES ---

export const studentProfiles = pgTable('student_profiles', {
	userId: text('user_id')
		.primaryKey()
		.references(() => user.id, { onDelete: 'cascade' }),
	studentIdNumber: varchar('student_id_number', { length: 50 }).notNull().unique(),
	programId: integer('program_id').references(() => programs.id, { onDelete: 'set null' }),
	age: integer('age'),
	weightKg: decimal('weight_kg', { precision: 5, scale: 2 }),
	heightCm: decimal('height_cm', { precision: 5, scale: 2 }),
	fitnessLevel: varchar('fitness_level', { length: 20 }).$type<
		'beginner' | 'intermediate' | 'advanced'
	>(),
	weeklyWorkoutGoal: integer('weekly_workout_goal').default(3)
});

export const workoutSessions = pgTable('workout_sessions', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text('user_id')
		.references(() => user.id, { onDelete: 'cascade' })
		.notNull(),
	exerciseId: integer('exercise_id')
		.references(() => exercises.id, { onDelete: 'restrict' })
		.notNull(),
	sessionDateTime: timestamp('session_date_time').defaultNow().notNull(),
	repsCompleted: integer('reps_completed').notNull(),
	averageFormScore: decimal('average_form_score', { precision: 5, scale: 2 }).notNull(),
	durationMinutes: integer('duration_minutes').notNull()
});

export const userSettings = pgTable('user_settings', {
	userId: text('user_id')
		.primaryKey()
		.references(() => user.id, { onDelete: 'cascade' }),
	realTimeVoiceAlerts: boolean('real_time_voice_alerts').default(true).notNull(),
	realTimeFormCorrection: boolean('real_time_form_correction').default(true).notNull(),
	gestureAutoCounting: boolean('gesture_auto_counting').default(true).notNull(),
	defaultCamera: varchar('default_camera', { length: 50 }).default('Front Camera').notNull(),
	darkmode: boolean('darkmode').default(false).notNull()
});

export const fitnessGoals = pgTable('fitness_goals', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text('user_id')
		.references(() => user.id, { onDelete: 'cascade' })
		.notNull(),
	title: varchar('title', { length: 255 }).notNull(),
	targetWorkouts: integer('target_workouts').notNull(),
	daysDuration: integer('days_duration').notNull(),
	startDate: timestamp('start_date').defaultNow().notNull(),
	endDate: timestamp('end_date').notNull(),
	status: varchar('status', { length: 20 })
		.$type<'active' | 'completed' | 'cancelled'>()
		.default('active')
		.notNull()
});
