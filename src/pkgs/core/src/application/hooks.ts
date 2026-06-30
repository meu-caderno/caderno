import { createHooks, type Hookable } from "hookable";
import type {
  Activity,
  Assessment,
  Record as AttendanceRecord,
  Context,
  Edge,
  Id,
  LibraryItem,
  Node,
  StudyMap,
  Subject,
} from "../domain";

export interface CadernoHooks {
  "context:created": (context: Context) => void;
  "context:updated": (context: Context) => void;
  "subject:created": (subject: Subject) => void;
  "subject:updated": (subject: Subject) => void;
  "subject:deleted": (id: Id) => void;
  "attendance:marked": (record: AttendanceRecord) => void;
  "assessment:added": (subject: Subject, assessment: Assessment) => void;
  "grade:set": (subject: Subject) => void;
  "activity:upserted": (activity: Activity) => void;
  "activity:deleted": (id: Id) => void;
  "library:changed": (item: LibraryItem) => void;
  "library:deleted": (id: Id) => void;
  "map:changed": (map: StudyMap) => void;
  "map:deleted": (id: Id) => void;
  "node:upserted": (node: Node) => void;
  "node:deleted": (id: Id) => void;
  "edge:upserted": (edge: Edge) => void;
  "edge:deleted": (id: Id) => void;
}

export type CadernoHookBus = Hookable<CadernoHooks>;

export function createCadernoHooks(): CadernoHookBus {
  return createHooks<CadernoHooks>();
}
