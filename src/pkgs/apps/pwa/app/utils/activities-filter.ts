import type { Activity, DayIso, Subject } from "@meu-caderno/core";
import {
  ActivityKind,
  ActivityStatus,
  DueBucket,
  groupByDue,
} from "@meu-caderno/core";

export type ActivityFilter = "all" | "open" | "done";
export type ActivityGroupBy = "due" | "subject" | "kind";

export interface ActivityGroup {
  key: string;
  label: string;
  rows: Activity[];
}

export interface GroupOptions {
  today?: DayIso;
  subjects?: Subject[];
}

const FALLBACK_TODAY = "1970-01-01" as DayIso;
const NO_SUBJECT_KEY = "none";

const DUE_COLUMNS: { bucket: DueBucket; label: string }[] = [
  { bucket: DueBucket.OVERDUE, label: "Atrasadas" },
  { bucket: DueBucket.TODAY, label: "Hoje" },
  { bucket: DueBucket.SOON, label: "Em breve" },
  { bucket: DueBucket.LATER, label: "Depois" },
  { bucket: DueBucket.NONE, label: "Sem data" },
];

const KIND_LABELS: Record<ActivityKind, string> = {
  [ActivityKind.EXAM]: "Provas",
  [ActivityKind.ASSIGNMENT]: "Entregas",
  [ActivityKind.READING]: "Leituras",
  [ActivityKind.TASK]: "Tarefas",
  [ActivityKind.CAPTURE]: "Capturas",
};

const STATUS_BY_FILTER: Record<
  Exclude<ActivityFilter, "all">,
  ActivityStatus
> = {
  open: ActivityStatus.OPEN,
  done: ActivityStatus.DONE,
};

export function filterActivities(
  rows: ReadonlyArray<Activity>,
  filter: ActivityFilter,
): Activity[] {
  if (filter === "all") return rows.slice();
  const status = STATUS_BY_FILTER[filter];
  return rows.filter((row) => row.status === status);
}

function buildGroups(
  rows: ReadonlyArray<Activity>,
  keyOf: (row: Activity) => string,
  labelOf: (key: string) => string,
): ActivityGroup[] {
  const order: string[] = [];
  const buckets = new Map<string, Activity[]>();
  for (const row of rows) {
    const key = keyOf(row);
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = [];
      buckets.set(key, bucket);
      order.push(key);
    }
    bucket.push(row);
  }
  return order.map((key) => ({
    key,
    label: labelOf(key),
    rows: buckets.get(key) ?? [],
  }));
}

function groupByDueColumns(
  rows: ReadonlyArray<Activity>,
  today: DayIso,
): ActivityGroup[] {
  const grouped = groupByDue(rows, today);
  return DUE_COLUMNS.map((column) => ({
    key: column.bucket,
    label: column.label,
    rows: grouped[column.bucket],
  })).filter((group) => group.rows.length > 0);
}

function groupBySubject(
  rows: ReadonlyArray<Activity>,
  subjects: Subject[],
): ActivityGroup[] {
  const names = new Map<string, string>(
    subjects.map((subject) => [subject.id, subject.name]),
  );
  return buildGroups(
    rows,
    (row) => row.subjectId ?? NO_SUBJECT_KEY,
    (key) =>
      key === NO_SUBJECT_KEY
        ? "Sem disciplina"
        : (names.get(key) ?? "Sem disciplina"),
  );
}

function groupByKind(rows: ReadonlyArray<Activity>): ActivityGroup[] {
  return buildGroups(
    rows,
    (row) => row.kind,
    (key) => KIND_LABELS[key as ActivityKind] ?? key,
  );
}

export function groupActivities(
  rows: ReadonlyArray<Activity>,
  by: ActivityGroupBy,
  options: GroupOptions = {},
): ActivityGroup[] {
  if (by === "due")
    return groupByDueColumns(rows, options.today ?? FALLBACK_TODAY);
  if (by === "subject") return groupBySubject(rows, options.subjects ?? []);
  return groupByKind(rows);
}
