import type { Id } from "../primitives";
import type { RelationKind } from "./relation-kind";

export interface FederationRelation {
  target: Id;
  kind: RelationKind;
}
