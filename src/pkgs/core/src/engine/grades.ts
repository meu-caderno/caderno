import type { Assessment, Grade } from "../domain";
import * as numeric from "./math";

type AssessmentScore = Pick<Assessment, "weight" | "grade">;

interface GradedAssessment {
  weight: number;
  grade: Grade;
}

function isGraded(assessment: AssessmentScore): assessment is GradedAssessment {
  return assessment.grade != null;
}

export function weightedAverage(
  assessments: ReadonlyArray<AssessmentScore>,
): number | null {
  const graded = assessments.filter(isGraded);
  if (graded.length === 0) return null;
  const totalWeight = numeric.sum(
    graded.map((assessment) => assessment.weight),
  );
  if (totalWeight === 0) return null;
  const weighted = numeric.sum(
    graded.map((assessment) =>
      numeric.multiply(assessment.grade, assessment.weight),
    ),
  );
  return numeric.divide(weighted, totalWeight);
}

export interface NeededGrade {
  needed: number;
  remainingWeight: number;
  secured: boolean;
  impossible: boolean;
}

export function neededGrade(
  assessments: ReadonlyArray<AssessmentScore>,
  target: number,
  max = 10,
): NeededGrade | null {
  const totalWeight = numeric.sum(
    assessments.map((assessment) => assessment.weight),
  );
  if (totalWeight === 0) return null;

  const earned = numeric.sum(
    assessments
      .filter(isGraded)
      .map((assessment) =>
        numeric.multiply(assessment.grade, assessment.weight),
      ),
  );
  const remainingWeight = numeric.sum(
    assessments
      .filter((assessment) => assessment.grade == null)
      .map((assessment) => assessment.weight),
  );

  if (remainingWeight === 0) return null;

  const needed = numeric.divide(
    numeric.subtract(numeric.multiply(target, totalWeight), earned),
    remainingWeight,
  );
  return {
    needed,
    remainingWeight,
    secured: needed <= 0,
    impossible: needed > max,
  };
}
