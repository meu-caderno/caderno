import type { Activity, DayIso, TimeBlock } from "@meu-caderno/core";
import {
  addDays,
  daysBetween,
  expandSchedule,
  weekdayOf,
} from "@meu-caderno/core";
import { useCaderno } from "~/composables/useCaderno";
import { formatDay } from "~/utils/caderno-stats";

export interface AgendaSession {
  subjectId: string;
  name: string;
  color: string;
  blocks: TimeBlock[];
}

export interface AgendaDay {
  day: DayIso;
  weekdayLabel: string;
  dayLabel: string;
  isToday: boolean;
  sessions: AgendaSession[];
  activities: Activity[];
}

const WEEKDAY_LABELS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const HORIZON_DAYS = 7;

export function useAgenda() {
  const { subjects, activities, today, booting, ready } = useCaderno();

  function sessionsOnDay(day: DayIso): AgendaSession[] {
    return subjects.value
      .filter(
        (subject) =>
          subject.schedule != null &&
          expandSchedule(subject.schedule, { from: day, to: day }).length > 0,
      )
      .map((subject) => ({
        subjectId: subject.id,
        name: subject.name,
        color: subject.color,
        blocks: subject.schedule?.blocks ?? [],
      }));
  }

  function activitiesOnDay(day: DayIso): Activity[] {
    return activities.value.filter((activity) => activity.dueDate === day);
  }

  function buildDay(day: DayIso, todayDay: DayIso): AgendaDay {
    return {
      day,
      weekdayLabel: WEEKDAY_LABELS[weekdayOf(day)] ?? "",
      dayLabel: formatDay(day),
      isToday: day === todayDay,
      sessions: sessionsOnDay(day),
      activities: activitiesOnDay(day),
    };
  }

  function daysInRange(from: DayIso, to: DayIso): AgendaDay[] {
    const span = daysBetween(from, to);
    if (span < 0) return [];
    const todayDay = today.value as DayIso;
    return Array.from({ length: span + 1 }, (_, offset) =>
      buildDay(addDays(from, offset), todayDay),
    );
  }

  const days = computed<AgendaDay[]>(() => {
    const start = today.value as DayIso;
    return daysInRange(start, addDays(start, HORIZON_DAYS - 1));
  });

  return { days, daysInRange, today, booting, ready };
}
