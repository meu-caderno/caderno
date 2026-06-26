import type { Id, Score } from "../primitives";

export interface Assessment {
  id: Id;

  subjectId: Id;
  name: string; // "Exam 1", "Problem set 3"
  weight: number;

  grade?: Score;
}
