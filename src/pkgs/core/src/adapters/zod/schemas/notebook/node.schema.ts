import * as z from "zod";
import { ActivityStatusSchema } from "../activity/activity-status.schema";
import { RootSchema } from "../activity/root.schema";
import { DateIsoSchema, IdSchema } from "../primitives";
import { AspectSchema } from "./aspect.schema";

export const NodeSchema = z.object({
  id: IdSchema,

  aspects: z.array(AspectSchema),

  title: z.string(),
  body: z.string().optional(),

  parentId: IdSchema.optional(),

  root: RootSchema.optional(),

  day: DateIsoSchema.optional(),
  status: ActivityStatusSchema.optional(),
});
