import { z } from 'zod';

export const formSchema = z.object({
	title: z.string().min(1, 'Title is required').max(255),
	targetWorkouts: z.coerce.number().int().min(1, 'At least 1 workout required'),
	daysDuration: z.coerce.number().int().min(7, 'Minimum 7 days').max(365, 'Maximum 365 days')
});

export type FormSchema = typeof formSchema;
