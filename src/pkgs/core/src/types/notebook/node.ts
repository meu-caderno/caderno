import type { ActivityStatus, Root } from "../activity";
import type { DateIso, Id } from "../primitives";
import type { Aspect } from "./aspect";

export interface Node {
  id: Id;

  aspects: Aspect[];

  title: string;
  body?: string;

  parentId?: Id;

  root?: Root;

  day?: DateIso;
  status?: ActivityStatus;
}
