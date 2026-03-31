import { z } from "zod";
 
export const formSchema = z.object({
    name: z.string().max(255),
    email: z.email(),
    password: z.string().min(3).max(256)
});

export type FormSchema = typeof formSchema;