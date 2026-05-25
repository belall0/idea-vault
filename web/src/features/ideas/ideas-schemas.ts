import * as z from "zod";

export const ideaFormSchema = z.object({
  title: z
    .string()
    .min(5, "Bug title must be at least 5 characters.")
    .max(100, "Bug title must be at most 100 characters."),
  summary: z
    .string()
    .min(10, "Summary must be at least 10 characters.")
    .max(300, "Summary must be at most 300 characters."),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters.")
    .max(600, "Description must be at most 600 characters."),
});

export type IdeaFormValues = z.infer<typeof ideaFormSchema>;
