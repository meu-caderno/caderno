import type { DateIso } from "../primitives";
import type { ScheduleKind } from "./schedule-kind";
import type { TimeBlock } from "./time-block";

export interface Schedule {
  kind: ScheduleKind;
  weekdays?: number[];
  blocks?: TimeBlock[];
  anchor?: DateIso;
  adHocDates?: DateIso[];
}
