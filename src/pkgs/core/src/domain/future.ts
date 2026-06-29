import type { Id } from "./values";

export enum RelationKind {
  ONE_WAY = "ONE_WAY",
  TWO_WAY = "TWO_WAY",
  BACKUP = "BACKUP",
  OWNERSHIP_HANDOFF = "OWNERSHIP_HANDOFF",
}

export interface FederationRelation {
  target: Id;
  kind: RelationKind;
}

export interface Federation {
  id: Id;
  name: string;
  contexts: Id[];
  relations: FederationRelation[];
}

export interface ServerNode {
  id: Id;
  label: string;
  federations: Id[];
}
