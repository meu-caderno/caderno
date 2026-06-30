import type { AttendanceRecord, Context, Subject } from "@meu-caderno/core";
import { recordsOf } from "@meu-caderno/core";
import { deriveStats, type SubjectStats } from "~/utils/caderno-stats";

export interface SubjectGroup {
  context: Context;
  stats: SubjectStats[];
}

function statsForContext(
  context: Context,
  subjects: Subject[],
  records: AttendanceRecord[],
): SubjectStats[] {
  return subjects
    .filter((subject) => subject.contextId === context.id)
    .map((subject) =>
      deriveStats(
        { ...subject, records: recordsOf(records, subject.id) },
        context.attendanceFloor,
      ),
    );
}

export function useSubjects() {
  const { store } = useCadernoService();

  const subjects = useLiveQuery(
    ["subjects"],
    () => store.subjects.list(),
    [] as Subject[],
  );
  const records = useLiveQuery(
    ["records"],
    () => store.records.list(),
    [] as AttendanceRecord[],
  );
  const contexts = useLiveQuery(
    ["contexts"],
    () => store.contexts.list(),
    [] as Context[],
  );

  const groups = computed<SubjectGroup[]>(() =>
    [...contexts.value]
      .filter((context) => !context.archived)
      .sort((left, right) => left.name.localeCompare(right.name))
      .map((context) => ({
        context,
        stats: statsForContext(context, subjects.value, records.value),
      }))
      .filter((group) => group.stats.length > 0),
  );

  const totalSubjects = computed(() =>
    groups.value.reduce((total, group) => total + group.stats.length, 0),
  );

  return { groups, totalSubjects };
}
