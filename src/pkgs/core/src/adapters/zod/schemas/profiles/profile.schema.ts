import * as z from "zod";
import { ColorSchema } from "../primitives";
import { IdSchema } from "../primitives/id.schema";
import { BackgroundSchema } from "./background.schema";
import { ContextModeSchema } from "./context-mode.schema";
import { DensitySchema } from "./density.schema";
import { ImmersionSchema } from "./immersion.schema";
import { WidgetPrefSchema } from "./widget-pref.schema";

export const ProfileSchema = z.object({
  id: IdSchema,

  name: z.string(),

  contextMode: ContextModeSchema,
  contexts: z.array(IdSchema).optional(),

  accent: ColorSchema.optional(),
  density: DensitySchema.optional(),
  background: BackgroundSchema.optional(),
  immersion: ImmersionSchema.optional(),
  widgets: z.array(WidgetPrefSchema).optional(),

  headingFont: z.string().optional(),
});
