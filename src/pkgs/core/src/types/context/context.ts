import type { Id } from "../primitives";
import type { AbsenceStance } from "./absence-stance";
import type { BackendRef } from "./backend-ref";
import type { Bucket } from "./bucket";
import type { Goal } from "./goal";
import type { Link } from "./link";
import type { Modules } from "./modules";
import type { Score } from "./score";
import type { Term } from "./term";
import type { Vocabulary } from "./vocabulary";

export interface Context {
  id: Id;

  name: string;

  goal: Goal;
  modules: Modules;

  link: Link;

  absenceStance: AbsenceStance;

  minAverage?: Score;
  attendanceFloor?: number;

  vocabulary?: Vocabulary;

  terms?: Term[];
  buckets?: Bucket[];

  social?: BackendRef;
}
