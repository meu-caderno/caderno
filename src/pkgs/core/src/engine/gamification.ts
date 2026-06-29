import type { DayIso } from "../domain";
import * as num from "./math";
import { addDays } from "./schedule";

export const XP_PER_PRESENCE = 5;
export const XP_PER_ACTIVITY = 10;
export const XP_PER_LEVEL = 100;

const FIRST_ACTION_THRESHOLD = 1;
const SHORT_STREAK_DAYS = 3;
const WEEK_STREAK_DAYS = 7;
const TASK_BADGE_THRESHOLD = 10;
const LEVEL_BADGE_THRESHOLD = 5;

export interface XpInput {
  presences: number;
  completedActivities: number;
}

export function totalXp(input: XpInput): number {
  return num.add(
    num.multiply(input.presences, XP_PER_PRESENCE),
    num.multiply(input.completedActivities, XP_PER_ACTIVITY),
  );
}

export interface Level {
  level: number;
  intoLevel: number;
  toNextLevel: number;
  ratio: number;
}

export function levelFromXp(xp: number): Level {
  const safeXp = Math.max(0, xp);
  const level = num.add(num.floor(num.divide(safeXp, XP_PER_LEVEL)), 1);
  const intoLevel = num.remainder(safeXp, XP_PER_LEVEL);
  return {
    level,
    intoLevel,
    toNextLevel: num.subtract(XP_PER_LEVEL, intoLevel),
    ratio: num.divide(intoLevel, XP_PER_LEVEL),
  };
}

export function currentStreak(
  days: ReadonlyArray<DayIso>,
  today: DayIso,
): number {
  const present = new Set<string>(days);
  let cursor = present.has(today) ? today : addDays(today, -1);
  if (!present.has(cursor)) return 0;
  let streak = 0;
  while (present.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export interface GamificationInput {
  streak: number;
  level: number;
  presences: number;
  completedActivities: number;
}

export interface Achievement {
  key: string;
  label: string;
  icon: string;
  unlocked: boolean;
}

export function achievements(input: GamificationInput): Achievement[] {
  return [
    {
      key: "first-step",
      label: "Primeiro passo",
      icon: "👣",
      unlocked:
        num.add(input.presences, input.completedActivities) >=
        FIRST_ACTION_THRESHOLD,
    },
    {
      key: "streak-3",
      label: "3 dias seguidos",
      icon: "🔥",
      unlocked: input.streak >= SHORT_STREAK_DAYS,
    },
    {
      key: "streak-7",
      label: "Uma semana",
      icon: "⚡",
      unlocked: input.streak >= WEEK_STREAK_DAYS,
    },
    {
      key: "ten-tasks",
      label: "10 tarefas",
      icon: "✅",
      unlocked: input.completedActivities >= TASK_BADGE_THRESHOLD,
    },
    {
      key: "level-5",
      label: "Nível 5",
      icon: "🏅",
      unlocked: input.level >= LEVEL_BADGE_THRESHOLD,
    },
  ];
}
