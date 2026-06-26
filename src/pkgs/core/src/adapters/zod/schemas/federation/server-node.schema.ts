import * as z from "zod";
import { IdSchema } from "../primitives";

/** A physical/logical server that hosts federations. */
export const ServerNodeSchema = z.object({
  id: IdSchema,
  label: z.string(),
  federations: z.array(IdSchema),
});
