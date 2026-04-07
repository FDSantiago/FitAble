import { z } from 'zod';

export const formSchema = z.object({
	age: z.coerce.number().int().min(1).max(120).optional(),
	weightKg: z.coerce.number().min(1).max(500).optional(),
	heightCm: z.coerce.number().min(1).max(300).optional(),
	fitnessLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
	weeklyWorkoutGoal: z.coerce.number().int().min(1).max(7).optional()
});

export type FormSchema = typeof formSchema;
