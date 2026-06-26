import * as z from "zod";
import { DateIsoSchema } from "../primitives";
import { ScheduleKindSchema } from "./schedule-kind.schema";
import { TimeBlockSchema } from "./time-block.schema";

export const ScheduleSchema = z.object({
  kind: ScheduleKindSchema,
  weekdays: z.array(z.number()).optional(),
  blocks: z.array(TimeBlockSchema).optional(),
  anchor: DateIsoSchema.optional(),
  adHocDates: z.array(DateIsoSchema).optional(),
});
