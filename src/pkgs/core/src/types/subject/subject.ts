import type { Color, Id } from "../primitives";
import type { Assessment } from "./assessment";
import type { Record } from "./record";
import type { Schedule } from "./schedule";

export interface Subject {
  id: Id;

  contextId: Id;

  name: string;
  color: Color;

  hoursPerClass: number;

  classesPerSession: number;

  totalClassHours?: number;

  credits?: number;

  floor?: number;

  schedule?: Schedule;

  assessments?: Assessment[];

  records?: Record[];
}
