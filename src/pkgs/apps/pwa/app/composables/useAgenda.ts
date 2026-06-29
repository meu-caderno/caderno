import type { Activity, DayIso, TimeBlock } from "@meu-caderno/core";
import { addDays, expandSchedule } from "@meu-caderno/core";
import { formatDay, useCaderno } from "~/composables/useCaderno";

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

  const days = computed<AgendaDay[]>(() => {
    const start = today.value as DayIso;
    return Array.from({ length: HORIZON_DAYS }, (_, offset) => {
      const day = addDays(start, offset);
      const weekday = new Date(`${day}T00:00:00`).getDay();
      return {
        day,
        weekdayLabel: WEEKDAY_LABELS[weekday] ?? "",
        dayLabel: formatDay(day),
        isToday: offset === 0,
        sessions: sessionsOnDay(day),
        activities: activitiesOnDay(day),
      };
    });
  });

  return { days, booting, ready };
}
