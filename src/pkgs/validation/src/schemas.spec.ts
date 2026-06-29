import { describe, expect, it } from "vitest";
import { ContextSchema, SubjectSchema } from "./schemas";

describe("schemas", () => {
  it("parses a valid context", () => {
    const ctx = ContextSchema.parse({
      id: "c1",
      name: "Faculdade",
      goal: "UNIVERSITY",
      link: "PERSONAL",
      absenceStance: "PLAN_ABSENCES",
      modules: {
        attendance: true,
        grades: true,
        term: true,
        streak: false,
        hours: false,
        syllabus: false,
        certificate: false,
      },
    });
    expect(ctx.id).toBe("c1");
  });

  it("rejects an invalid color", () => {
    expect(
      SubjectSchema.safeParse({
        id: "s",
        contextId: "c",
        name: "n",
        color: "red",
        hoursPerClass: 1,
        classesPerSession: 1,
      }).success,
    ).toBe(false);
  });
});
