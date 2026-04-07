import { z } from "zod";
 
export const formSchema = z.object({
    name: z.string().max(255).min(1, "A name is required"),
    email: z.email(),
    password: z.string().min(8, "Password must be at least 8 characters").max(256, "Password must be less than 256 characters")
});

export type FormSchema = typeof formSchema;