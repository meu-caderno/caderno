import type { Id } from "../primitives";

export interface Subtask {
  id: Id;
  text: string;
  done: boolean;
}
