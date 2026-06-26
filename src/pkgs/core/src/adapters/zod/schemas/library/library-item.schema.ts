import * as z from "zod";
import { IdSchema } from "../primitives/id.schema";

export const LibraryItemSchema = z.object({
  id: IdSchema,

  title: z.string(),
  cover: z.string().optional(),
  synopsis: z.string().optional(),

  progress: z.number().optional(),
  stars: z.number().optional(),
});
