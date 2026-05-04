import * as z from "zod";

export const ideaFormSchema = z.object({
  title: z
    .string()
    .min(5, "Bug title must be at least 5 characters.")
    .max(32, "Bug title must be at most 32 characters."),
  summary: z
    .string()
    .min(10, "Summary must be at least 10 characters.")
    .max(100, "Summary must be at most 100 characters."),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters.")
    .max(200, "Description must be at most 200 characters."),
});

export type IdeaFormValues = z.infer<typeof ideaFormSchema>;
