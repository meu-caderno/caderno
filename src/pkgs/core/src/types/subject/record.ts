import type { DateIso, Id } from "../primitives";
import type { AttendanceStatus } from "./attendance-status";

export interface Record {
  id: Id;

  subjectId: Id;

  day: DateIso;
  status: AttendanceStatus;

  block?: number;
}
