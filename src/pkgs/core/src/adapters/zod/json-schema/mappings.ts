import * as z from "zod";
import { ColorSchema, DateIsoSchema, IdSchema, InstantSchema, ScoreSchema } from "../schemas";

export const mappings: [z.ZodType, string][] = [
  [ColorSchema, "Color"],
  [DateIsoSchema, "DateIso"],
  [IdSchema, "Id"],
  [InstantSchema, "Instant"],
  [ScoreSchema, "Score"],
];
