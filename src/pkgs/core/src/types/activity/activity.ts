import type { DateIso, Id } from "../primitives";
import type { ActivityKind } from "./activity-kind";
import type { ActivityStatus } from "./activity-status";
import type { Recurrence } from "./recurrence";
import type { Root } from "./root";
import type { Subtask } from "./subtask";

export interface Activity {
  id: Id;

  title: string;
  dueDate?: DateIso;

  contextId?: Id;
  subjectId?: Id;

  kind: ActivityKind;
  status: ActivityStatus;
  root: Root;

  subtasks?: Subtask[];

  /**
   * Deadline link: this activity prepares another (an exam, say).
   * Born `gapDays` before the target; if the target is rescheduled, it follows.
   */
  preparesId?: Id;
  gapDays?: number;

  /** Recurrence: concrete occurrences share the same `seriesId`. */
  seriesId?: Id;
  recurrence?: Recurrence;

  /** Where it came from (plugin, member, import). */
  origin?: string;
}
