import * as z from "zod";
import { ClockTimeSchema } from "../primitives";

export const TimeBlockSchema = z.object({
  start: ClockTimeSchema,
  end: ClockTimeSchema,
});
