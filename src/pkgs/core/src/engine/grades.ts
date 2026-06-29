import type { Assessment } from "../domain";
import * as num from "./math";

export function weightedAverage(
  assessments: ReadonlyArray<Pick<Assessment, "weight" | "grade">>,
): number | null {
  const graded = assessments.filter((a) => a.grade != null);
  if (graded.length === 0) return null;
  const totalWeight = num.sum(graded.map((a) => a.weight));
  if (totalWeight === 0) return null;
  const weighted = num.sum(
    graded.map((a) => num.multiply(a.grade as number, a.weight)),
  );
  return num.divide(weighted, totalWeight);
}

export interface NeededGrade {
  needed: number;
  remainingWeight: number;
  secured: boolean;
  impossible: boolean;
}

export function neededGrade(
  assessments: ReadonlyArray<Pick<Assessment, "weight" | "grade">>,
  target: number,
  max = 10,
): NeededGrade | null {
  const totalWeight = num.sum(assessments.map((a) => a.weight));
  if (totalWeight === 0) return null;

  const earned = num.sum(
    assessments
      .filter((a) => a.grade != null)
      .map((a) => num.multiply(a.grade as number, a.weight)),
  );
  const remainingWeight = num.sum(
    assessments.filter((a) => a.grade == null).map((a) => a.weight),
  );

  if (remainingWeight === 0) return null;

  const needed = num.divide(
    num.subtract(num.multiply(target, totalWeight), earned),
    remainingWeight,
  );
  return {
    needed,
    remainingWeight,
    secured: needed <= 0,
    impossible: needed > max,
  };
}
