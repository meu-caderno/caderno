import * as z from "zod";
import { DateIsoSchema, IdSchema } from "../primitives";

export const TermSchema = z.object({
  id: IdSchema,

  label: z.string(),

  start: DateIsoSchema.optional(),
  end: DateIsoSchema.optional(),
});
