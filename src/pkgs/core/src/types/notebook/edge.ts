import type { Id } from "../primitives";
import { EdgeKind } from "./edge-kind";

export interface Edge {
  id: Id;
  from: Id;
  to: Id;
  kind: EdgeKind;
}
