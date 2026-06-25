import * as z from "zod";

export const VocabularySchema = z.object({
  attendance: z.string(),
  subject: z.string(),
  activity: z.string(),
  term: z.string(),
})
