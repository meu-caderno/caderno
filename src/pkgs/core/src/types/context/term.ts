import type { DateIso, Id } from "../primitives";

export interface Term {
  id: Id;

  label: string; // "2026.1"

  start?: DateIso;
  end?: DateIso;
}
