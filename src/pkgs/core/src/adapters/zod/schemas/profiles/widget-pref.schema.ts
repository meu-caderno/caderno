import * as z from "zod";

export const WidgetPrefSchema = z.object({
  widget: z.string(),
  visible: z.boolean(),
});
