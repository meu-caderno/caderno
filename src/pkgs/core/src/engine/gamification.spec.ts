import { describe, expect, it } from "vitest";
import type { DayIso } from "../domain";
import {
  achievements,
  currentStreak,
  levelFromXp,
  totalXp,
} from "./gamification";

const asDay = (value: string) => value as DayIso;

describe("totalXp", () => {
  it("sums presence and activity XP", () => {
    expect(totalXp({ presences: 4, completedActivities: 3 })).toBe(50);
  });
});

describe("levelFromXp", () => {
  it("derives level and progress into the level", () => {
    const level = levelFromXp(250);
    expect(level.level).toBe(3);
    expect(level.intoLevel).toBe(50);
    expect(level.toNextLevel).toBe(50);
    expect(level.ratio).toBe(0.5);
  });

  it("starts at level 1 with no xp", () => {
    expect(levelFromXp(0).level).toBe(1);
  });
});

describe("currentStreak", () => {
  it("counts consecutive days ending today", () => {
    const days = [
      asDay("2026-03-08"),
      asDay("2026-03-09"),
      asDay("2026-03-10"),
    ];
    expect(currentStreak(days, asDay("2026-03-10"))).toBe(3);
  });

  it("allows the streak to end yesterday", () => {
    const days = [asDay("2026-03-08"), asDay("2026-03-09")];
    expect(currentStreak(days, asDay("2026-03-10"))).toBe(2);
  });

  it("breaks on a gap", () => {
    const days = [
      asDay("2026-03-05"),
      asDay("2026-03-09"),
      asDay("2026-03-10"),
    ];
    expect(currentStreak(days, asDay("2026-03-10"))).toBe(2);
  });

  it("is zero when the last activity is too old", () => {
    expect(currentStreak([asDay("2026-03-01")], asDay("2026-03-10"))).toBe(0);
  });
});

describe("achievements", () => {
  it("unlocks based on thresholds", () => {
    const unlocked = achievements({
      streak: 7,
      level: 5,
      presences: 20,
      completedActivities: 12,
    });
    expect(unlocked.every((achievement) => achievement.unlocked)).toBe(true);
  });

  it("keeps high tiers locked early on", () => {
    const list = achievements({
      streak: 1,
      level: 1,
      presences: 1,
      completedActivities: 0,
    });
    const byKey = Object.fromEntries(
      list.map((achievement) => [achievement.key, achievement.unlocked]),
    );
    expect(byKey["first-step"]).toBe(true);
    expect(byKey["streak-7"]).toBe(false);
    expect(byKey["level-5"]).toBe(false);
  });
});
