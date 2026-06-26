import * as z from "zod";
import { IdSchema, InstantSchema } from "../primitives";
import { OpKindSchema } from "./op-kind.schema";

export const OpLogEntrySchema = z.object({
  ts: InstantSchema,
  entity: z.string(),
  op: OpKindSchema,
  id: IdSchema,
});
