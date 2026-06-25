import * as z from "zod";
import { IdSchema } from "../primitives/id.schema";
import { EdgeKindSchema } from "./edge-kind.schema";

export const EdgeSchema = z.object({
  id: IdSchema,
  from: IdSchema,
  to: IdSchema,
  kind: EdgeKindSchema,
})
