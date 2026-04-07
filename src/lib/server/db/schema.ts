import { 
  pgTable, 
  uuid, 
  varchar, 
  decimal, 
  integer, 
  timestamp, 
  boolean,
  serial
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// --- TABLE DEFINITIONS ---

// NEW: Separated to resolve update anomalies for program names
export const programs = pgTable('programs', {
  id: serial('id').primaryKey(),
  programName: varchar('program_name', { length: 255 }).notNull().unique(),
});

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  studentIdNumber: varchar('student_id_number', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  programId: integer('program_id').references(() => programs.id, { onDelete: 'set null' }),
  weightKg: decimal('weight_kg', { precision: 5, scale: 2 }),
  heightCm: decimal('height_cm', { precision: 5, scale: 2 }),
  weeklyWorkoutGoal: integer('weekly_workout_goal').default(3),
});

export const exercises = pgTable('exercises', {
  id: serial('id').primaryKey(),
  exerciseName: varchar('exercise_name', { length: 100 }).notNull().unique(),
});

export const workoutSessions = pgTable('workout_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  exerciseId: integer('exercise_id')
    .references(() => exercises.id, { onDelete: 'restrict' })
    .notNull(),
  sessionDateTime: timestamp('session_date_time').defaultNow().notNull(),
  repsCompleted: integer('reps_completed').notNull(),
  averageFormScore: decimal('average_form_score', { precision: 5, scale: 2 }).notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
});

export const userSettings = pgTable('user_settings', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  realTimeVoiceAlerts: boolean('real_time_voice_alerts').default(true).notNull(),
  realTimeFormCorrection: boolean('real_time_form_correction').default(true).notNull(),
  gestureAutoCounting: boolean('gesture_auto_counting').default(true).notNull(),
  defaultCamera: varchar('default_camera', { length: 50 }).default('Front Camera').notNull(),
});

// --- RELATIONS ---

export const programsRelations = relations(programs, ({ many }) => ({
  users: many(users),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  program: one(programs, {
    fields: [users.programId],
    references: [programs.id],
  }),
  settings: one(userSettings, {
    fields: [users.id],
    references: [userSettings.userId],
  }),
  workoutSessions: many(workoutSessions),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}));

export const exercisesRelations = relations(exercises, ({ many }) => ({
  workoutSessions: many(workoutSessions),
}));

export const workoutSessionsRelations = relations(workoutSessions, ({ one }) => ({
  user: one(users, {
    fields: [workoutSessions.userId],
    references: [users.id],
  }),
  exercise: one(exercises, {
    fields: [workoutSessions.exerciseId],
    references: [exercises.id],
  }),
}));

export * from './auth.schema.ts';
