import * as z from "zod";
import { ColorSchema, IdSchema } from "../primitives";
import { AssessmentSchema } from "./assessment.schema";
import { RecordSchema } from "./record.schema";
import { ScheduleSchema } from "./schedule.schema";

export const SubjectSchema = z.object({
  id: IdSchema,

  contextId: IdSchema,

  name: z.string(),
  color: ColorSchema,

  hoursPerClass: z.number(),

  classesPerSession: z.number(),

  totalClassHours: z.number().optional(),

  credits: z.number().optional(),

  floor: z.number().optional(),

  schedule: ScheduleSchema.optional(),

  assessments: z.array(AssessmentSchema).optional(),

  records: z.array(RecordSchema).optional(),
});
