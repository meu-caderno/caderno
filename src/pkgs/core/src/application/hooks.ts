import { createHooks, type Hookable } from "hookable";
import type {
  Activity,
  Record as AttendanceRecord,
  Context,
  Id,
  Subject,
} from "../domain";

export interface CadernoHooks {
  "context:created": (context: Context) => void;
  "context:updated": (context: Context) => void;
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
