import * as z from "zod";
import { IdSchema } from "../primitives/id.schema";

export const SubtaskSchema = z.object({
  id: IdSchema,
  text: z.string(),
  done: z.boolean(),
})
