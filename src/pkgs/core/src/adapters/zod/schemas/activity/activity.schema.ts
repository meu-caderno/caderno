import * as z from "zod";
import { DateIsoSchema } from "../primitives/date-iso.schema";
import { IdSchema } from "../primitives/id.schema";
import { ActivityKindSchema } from "./activity-kind.schema";
import { ActivityStatusSchema } from "./activity-status.schema";
import { RecurrenceSchema } from "./recurrence.schema";
import { RootSchema } from "./root.schema";
import { SubtaskSchema } from "./subtask.schema";

export const ActivitySchema = z.object({
  id: IdSchema,

  title: z.string(),
  dueDate: DateIsoSchema.optional(),

  contextId: IdSchema.optional(),
  subjectId: IdSchema.optional(),

  kind: ActivityKindSchema,
  status: ActivityStatusSchema,
  root: RootSchema,

  subtasks: z.array(SubtaskSchema).optional(),

  preparesId: IdSchema.optional(),
  gapDays: z.number().optional(),

  seriesId: IdSchema.optional(),
  recurrence: RecurrenceSchema.optional(),

  origin: z.string().optional(),
});
