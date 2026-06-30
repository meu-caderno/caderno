import type {
  Record as AttendanceRecord,
  Id,
  Subject,
} from "@meu-caderno/core";
import {
  filterRecords,
  groupRecords,
  type PresenceRow,
} from "~/utils/presences";

export function usePresences() {
  const { store } = useCadernoService();
  const { effectiveId } = useActiveContext();

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

  const subjectById = computed(() => {
    const map = new Map<Id, Subject>();
    for (const subject of subjects.value) map.set(subject.id, subject);
    return map;
  });

  function enrich(record: AttendanceRecord): PresenceRow | null {
    const subject = subjectById.value.get(record.subjectId);
    if (!subject || subject.contextId !== effectiveId.value) return null;
    return { record, subject };
  }

  const rows = computed<PresenceRow[]>(() =>
    records.value
      .map(enrich)
      .filter((row): row is PresenceRow => row !== null)
      .sort((left, right) => right.record.day.localeCompare(left.record.day)),
  );

  const total = computed(() => rows.value.length);

  return { rows, total, filterRecords, groupRecords };
}
