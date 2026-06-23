import { Color, Id } from "../primitives";
import { Assessment } from "./assessment";
import { Record } from "./record";
import { Schedule } from "./schedule";

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
