import type {
  Activity,
  Record as AttendanceRecord,
  DayIso,
} from "@meu-caderno/core";
import {
  ActivityStatus,
  AttendanceStatus,
  achievements,
  currentStreak,
  levelFromXp,
  totalXp,
} from "@meu-caderno/core";
import type { Ref } from "vue";
import type { SubjectStats } from "~/utils/caderno-stats";

export interface GamificationInput {
  stats: Ref<SubjectStats[]>;
  activities: Ref<Activity[]>;
  records: Ref<AttendanceRecord[]>;
  today: Ref<string>;
}

export function useGamification(input: GamificationInput) {
  return computed(() => {
    const presences = input.stats.value.reduce(
      (total, stat) => total + stat.counts.present,
      0,
    );
    const completedActivities = input.activities.value.filter(
      (activity) => activity.status === ActivityStatus.DONE,
    ).length;
    const activeDays = [
      ...new Set(
        input.records.value
          .filter(
            (record) =>
              record.status === AttendanceStatus.PRESENT ||
              record.status === AttendanceStatus.LATE,
          )
          .map((record) => record.day),
      ),
    ] as DayIso[];
    const xp = totalXp({ presences, completedActivities });
    const level = levelFromXp(xp);
    const streak = currentStreak(activeDays, input.today.value as DayIso);
    const badges = achievements({
      streak,
      level: level.level,
      presences,
      completedActivities,
    });
    return { xp, ...level, streak, badges };
  });
}
