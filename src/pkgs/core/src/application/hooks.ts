import { createHooks, type Hookable } from "hookable";
import type {
  Activity,
  Record as AttendanceRecord,
  Id,
  Subject,
} from "../domain";

export interface CadernoHooks {
  "subject:created": (subject: Subject) => void;
  "subject:deleted": (id: Id) => void;
  "attendance:marked": (record: AttendanceRecord) => void;
  "grade:set": (subject: Subject) => void;
  "activity:upserted": (activity: Activity) => void;
}

export type CadernoHookBus = Hookable<CadernoHooks>;

export function createCadernoHooks(): CadernoHookBus {
  return createHooks<CadernoHooks>();
}
