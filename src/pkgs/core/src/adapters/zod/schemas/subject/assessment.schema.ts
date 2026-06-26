import * as z from "zod";
import { IdSchema, ScoreSchema } from "../primitives";

export const AssessmentSchema = z.object({
  id: IdSchema,

  subjectId: IdSchema,
  name: z.string(), // "Exam 1", "Problem set 3"
  weight: z.number(),

  grade: ScoreSchema.optional(),
});
