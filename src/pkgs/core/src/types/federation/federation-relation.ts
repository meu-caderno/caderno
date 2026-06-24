import type { Id } from "../primitives";
import { RelationKind } from "./relation-kind";

export interface FederationRelation {
  target: Id;
  kind: RelationKind;
}
