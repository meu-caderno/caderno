import z from "zod";
import { IdSchema, ScoreSchema } from "../primitives";
import { AbsenceStanceSchema } from "./absence-stance.schema";
import { BackendRefSchema } from "./backend-ref.schema";
import { BucketSchema } from "./bucket.schema";
import { GoalSchema } from "./goal.schema";
import { LinkSchema } from "./link.schema";
import { ModulesSchema } from "./modules.schema";
import { TermSchema } from "./term.schema";
import { VocabularySchema } from "./vocabulary.schema";

export const ContextSchem = z.object({
  id: IdSchema,

  name: z.string(),

  goal: GoalSchema,
  modules: ModulesSchema,

  link: LinkSchema,

  absenceStance: AbsenceStanceSchema,

  minAverage: ScoreSchema.optional(),
  attendanceFloor: z.number().optional(),

  vocabulary: VocabularySchema.optional(),

  terms: z.array(TermSchema).optional(),
  buckets: z.array(BucketSchema).optional(),

  social: BackendRefSchema.optional(),
});
