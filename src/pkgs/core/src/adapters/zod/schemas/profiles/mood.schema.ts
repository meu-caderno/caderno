import * as z from "zod";
import { ColorSchema } from "../primitives/color.schema";
import { IdSchema } from "../primitives/id.schema";
import { BackgroundSchema } from "./background.schema";
import { DensitySchema } from "./density.schema";
import { ImmersionSchema } from "./immersion.schema";
import { WidgetPrefSchema } from "./widget-pref.schema";

export const MoodSchema = z.object({
  id: IdSchema,

  name: z.string(),

  density: DensitySchema,
  dopamine: z.boolean(),
  immersion: ImmersionSchema,
  accent: ColorSchema.optional(),
  background: BackgroundSchema.optional(),

  widgets: z.array(WidgetPrefSchema).optional(),

  scope: z.array(IdSchema).optional(),
});
