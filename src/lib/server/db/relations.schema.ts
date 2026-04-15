// src/db/schema/relations.ts
import { relations } from 'drizzle-orm';
import { user, session, account } from './auth.schema';
import {
	programs,
	exercises,
	studentProfiles,
	workoutSessions,
	userSettings,
	fitnessGoals
} from './app.schema';

// --- LOOKUP RELATIONS ---

export const programsRelations = relations(programs, ({ many }) => ({
	students: many(studentProfiles)
}));

export const exercisesRelations = relations(exercises, ({ many }) => ({
	workoutSessions: many(workoutSessions)
}));

// --- AUTH RELATIONS (Including cross-file links to App) ---

export const userRelations = relations(user, ({ one, many }) => ({
	// Auth native
	sessions: many(session),
	accounts: many(account),
	// App native
	profile: one(studentProfiles, {
		fields: [user.id],
		references: [studentProfiles.userId]
	}),
	settings: one(userSettings, {
		fields: [user.id],
		references: [userSettings.userId]
	}),
	workoutSessions: many(workoutSessions),
	fitnessGoals: many(fitnessGoals)
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	})
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	})
}));

// --- APP RELATIONS ---

export const studentProfilesRelations = relations(studentProfiles, ({ one }) => ({
	user: one(user, {
		fields: [studentProfiles.userId],
		references: [user.id]
	}),
	program: one(programs, {
		fields: [studentProfiles.programId],
		references: [programs.id]
	})
}));

export const workoutSessionsRelations = relations(workoutSessions, ({ one }) => ({
	user: one(user, {
		fields: [workoutSessions.userId],
		references: [user.id]
	}),
	exercise: one(exercises, {
		fields: [workoutSessions.exerciseId],
		references: [exercises.id]
	})
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
	user: one(user, {
		fields: [userSettings.userId],
		references: [user.id]
	})
}));

export const fitnessGoalsRelations = relations(fitnessGoals, ({ one }) => ({
	user: one(user, {
		fields: [fitnessGoals.userId],
		references: [user.id]
	})
}));
