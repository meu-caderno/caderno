import * as z from "zod";
import { IdSchema } from "../primitives/id.schema";
import { BucketUnitSchema } from "./bucket-unit.schema";

export const BucketSchema = z.object({
  id: IdSchema,

  name: z.string(),
  icon: z.string().optional(),

  done: z.number(),
  goal: z.number(),

  unit: z.union([BucketUnitSchema, z.string()])
})
