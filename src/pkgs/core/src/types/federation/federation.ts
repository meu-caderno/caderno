import type { Id } from "../primitives";
import { FederationRelation } from "./federation-relation";

export interface Federation {
  id: Id;
  name: string;

  /** Contexts living under this federation. */
  contexts: Id[];

  /** Relations to other federations (same server or not). */
  relations: FederationRelation[];
}
