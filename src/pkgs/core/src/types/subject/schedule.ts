import { DateIso } from "../primitives";
import { ScheduleKind } from "./schedule-kind";
import { TimeBlock } from "./time-block";

export interface Schedule {
  kind: ScheduleKind;
  weekdays?: number[];
  blocks?: TimeBlock[];
  anchor?: DateIso;
  adHocDates?: DateIso[];
}
