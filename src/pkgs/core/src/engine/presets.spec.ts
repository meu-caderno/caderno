import { describe, expect, it } from "vitest";
import type { Context, Id } from "../domain";
import { AbsenceStance, Goal, Link } from "../domain";
import { applyPreset, presetForGoal } from "./presets";

const id = (value: string) => value as Id;

describe("presetForGoal", () => {
  it("university enables attendance/grades/term with a floor", () => {
    const preset = presetForGoal(Goal.UNIVERSITY);
    expect(preset.modules.attendance).toBe(true);
    expect(preset.modules.term).toBe(true);
    expect(preset.attendanceFloor).toBe(0.75);
    expect(preset.absenceStance).toBe(AbsenceStance.PLAN_ABSENCES);
  });
});

describe("applyPreset", () => {
  it("keeps user values and only adds missing modules (preset é convite)", () => {
    const context: Context = {
      id: id("c"),
      name: "x",
      goal: Goal.UNIVERSITY,
      link: Link.PERSONAL,
      absenceStance: AbsenceStance.FOCUS_ON_NOT_MISSING,
      attendanceFloor: 0.6,
      modules: {
        attendance: true,
        grades: false,
        term: false,
        streak: false,
        hours: false,
        syllabus: false,
        certificate: false,
      },
    };
    const out = applyPreset(context, presetForGoal(Goal.UNIVERSITY));
    expect(out.attendanceFloor).toBe(0.6);
    expect(out.modules.term).toBe(true);
    expect(out.modules.attendance).toBe(true);
    expect(out.absenceStance).toBe(AbsenceStance.FOCUS_ON_NOT_MISSING);
  });
});
