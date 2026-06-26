import * as z from "zod";
import { IdSchema } from "../primitives";

export const BackendRefSchema = z.object({
  backend: z.string().optional(),
  hostId: IdSchema.optional(),
});
