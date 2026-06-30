import type { Context, Modules, Vocabulary } from "../domain";
import { AbsenceStance, Goal } from "../domain";
import { DEFAULT_ATTENDANCE_FLOOR } from "./attendance";

export interface ContextPreset {
  modules: Modules;
  vocabulary: Vocabulary;
  absenceStance: AbsenceStance;
  attendanceFloor?: number;
}

function modules(on: Partial<Modules>): Modules {
  return {
    attendance: false,
    grades: false,
    term: false,
    streak: false,
    hours: false,
    syllabus: false,
    certificate: false,
    ...on,
  };
}

function vocabulary(
  subject: string,
  activity: string,
  attendance: string,
  term: string,
): Vocabulary {
  return { subject, activity, attendance, term };
}

const freeStudyPreset: ContextPreset = {
  modules: modules({}),
  vocabulary: vocabulary("assunto", "tarefa", "estudo", "período"),
  absenceStance: AbsenceStance.FOCUS_ON_NOT_MISSING,
};

const PRESETS: Record<Goal, ContextPreset> = {
  [Goal.UNIVERSITY]: {
    modules: modules({ attendance: true, grades: true, term: true }),
    vocabulary: vocabulary("disciplina", "atividade", "presença", "período"),
    absenceStance: AbsenceStance.PLAN_ABSENCES,
    attendanceFloor: DEFAULT_ATTENDANCE_FLOOR,
  },
  [Goal.PUBLIC_EXAM]: {
    modules: modules({ grades: true, streak: true, hours: true }),
    vocabulary: vocabulary("matéria", "tarefa", "estudo", "ciclo"),
    absenceStance: AbsenceStance.FOCUS_ON_NOT_MISSING,
  },
  [Goal.OPEN_COURSE]: {
    modules: modules({ hours: true, certificate: true }),
    vocabulary: vocabulary("módulo", "tarefa", "aula", "curso"),
    absenceStance: AbsenceStance.FOCUS_ON_NOT_MISSING,
  },
  [Goal.FREE_STUDY]: freeStudyPreset,
  [Goal.NONE]: freeStudyPreset,
};

export function presetForGoal(goal: Goal): ContextPreset {
  return PRESETS[goal];
}

export function applyPreset(context: Context, preset: ContextPreset): Context {
  const merged: Modules = { ...context.modules };
  for (const key of Object.keys(preset.modules) as (keyof Modules)[]) {
    if (preset.modules[key]) merged[key] = true;
  }
  return {
    ...context,
    modules: merged,
    vocabulary: context.vocabulary ?? preset.vocabulary,
    attendanceFloor: context.attendanceFloor ?? preset.attendanceFloor,
  };
}
