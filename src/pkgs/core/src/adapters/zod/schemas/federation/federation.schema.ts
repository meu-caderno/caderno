import * as z from "zod";
import { IdSchema } from "../primitives";
import { FederationRelationSchema } from "./federation-relation.schema";

export const FederationSchema = z.object({
  id: IdSchema,
  name: z.string(),

  /** Contexts living under this federation. */
  contexts: z.array(IdSchema),

  /** Relations to other federations (same server or not). */
  relations: z.array(FederationRelationSchema),
});
