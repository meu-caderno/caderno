import * as z from "zod";

export const ModulesSchema = z.object({
  attendance: z.boolean(),
  grades: z.boolean(),
  term: z.boolean(),
  streak: z.boolean(),
  syllabus: z.boolean(),
  certificate: z.boolean(),
  hours: z.boolean(),
});
