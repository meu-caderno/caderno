import type { Id } from "../primitives";

/** A physical/logical server that hosts federations. */

export interface ServerNode {
  id: Id;
  label: string;
  federations: Id[];
}
