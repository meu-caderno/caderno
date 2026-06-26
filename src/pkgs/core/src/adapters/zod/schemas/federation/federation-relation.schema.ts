import * as z from "zod";
import { IdSchema } from "../primitives";
import { RelationKindSchema } from "./relation-kind.schema";

export const FederationRelationSchema = z.object({
  target: IdSchema,
  kind: RelationKindSchema,
});
