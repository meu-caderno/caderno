import type { Context, Subject } from "@meu-caderno/core";
import { parseISO } from "date-fns";
import type { ComputedRef, Ref } from "vue";
import {
  deriveStats,
  type SubjectStats,
  type TodayClass,
} from "~/utils/caderno-stats";

export interface DailyRollInput {
  subjects: Ref<Subject[]>;
  stats: Ref<SubjectStats[]>;
  context: Ref<Context | null>;
  today: Ref<string>;
}

export function useDailyRoll(input: DailyRollInput): ComputedRef<TodayClass[]> {
  return computed(() => {
    const weekday = parseISO(input.today.value).getDay();
    return input.subjects.value
      .filter((subject) => subject.schedule?.weekdays?.includes(weekday))
      .map((subject) => {
        const subjectStats =
          input.stats.value.find((entry) => entry.subject.id === subject.id) ??
          deriveStats(subject, input.context.value?.attendanceFloor);
        const block = subject.schedule?.blocks?.[0];
        return {
          subject,
          stats: subjectStats,
          block: block ? `${block.start}–${block.end}` : undefined,
          marked:
            (subject.records ?? []).find(
              (record) => record.day === input.today.value,
            )?.status ?? null,
        };
      });
  });
}
