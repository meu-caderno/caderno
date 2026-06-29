import type { DayIso } from "../domain";
import * as num from "./math";
import { addDays } from "./schedule";

export const XP_PER_PRESENCE = 5;
export const XP_PER_ACTIVITY = 10;
export const XP_PER_LEVEL = 100;

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
  const safe = Math.max(0, xp);
  const level = num.floor(num.divide(safe, XP_PER_LEVEL)) + 1;
  const intoLevel = safe % XP_PER_LEVEL;
  return {
    level,
    intoLevel,
    toNextLevel: XP_PER_LEVEL - intoLevel,
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
      unlocked: input.presences + input.completedActivities >= 1,
    },
    {
      key: "streak-3",
      label: "3 dias seguidos",
      icon: "🔥",
      unlocked: input.streak >= 3,
    },
    {
      key: "streak-7",
      label: "Uma semana",
      icon: "⚡",
      unlocked: input.streak >= 7,
    },
    {
      key: "ten-tasks",
      label: "10 tarefas",
      icon: "✅",
      unlocked: input.completedActivities >= 10,
    },
    {
      key: "level-5",
      label: "Nível 5",
      icon: "🏅",
      unlocked: input.level >= 5,
    },
  ];
}
