import * as z from "zod";
import { DateIsoSchema, IdSchema } from "../primitives";
import { AttendanceStatusSchema } from "./attendance-status.schema";

export const RecordSchema = z.object({
  id: IdSchema,

  subjectId: IdSchema,

  day: DateIsoSchema,
  status: AttendanceStatusSchema,

  block: z.number().optional(),
});
