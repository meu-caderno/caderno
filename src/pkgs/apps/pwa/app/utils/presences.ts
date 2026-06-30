import type { AttendanceRecord, Subject } from "@meu-caderno/core";
import { AttendanceStatus } from "@meu-caderno/core";
import { formatDay } from "./caderno-stats";

export interface PresenceRow {
  record: AttendanceRecord;
  subject: Subject;
}

export type PresenceFilter = "all" | "misses" | "present";
export type PresenceGrouping = "date" | "subject" | "status";

export interface PresenceGroup {
  key: string;
  label: string;
  rows: PresenceRow[];
}

export interface AttendanceVisual {
  label: string;
  color: string;
  icon: string;
}

// Hex reaproveitado dos tokens papel-tinta --pt-ok / --pt-danger / --pt-warn.
const OK = "#2f7d4f";
const DANGER = "#c0392b";
const WARN = "#b8862b";
const MUTED = "#8a8780";

export const ATTENDANCE_LABEL: Record<AttendanceStatus, string> = {
  [AttendanceStatus.PRESENT]: "Presente",
  [AttendanceStatus.ABSENT]: "Falta",
  [AttendanceStatus.LATE]: "Atraso",
  [AttendanceStatus.MEDICAL]: "Atestado",
  [AttendanceStatus.WAIVED]: "Abono",
  [AttendanceStatus.HOLIDAY]: "Feriado",
  [AttendanceStatus.CANCELED]: "Cancelada",
};

export const ATTENDANCE_COLOR: Record<AttendanceStatus, string> = {
  [AttendanceStatus.PRESENT]: OK,
  [AttendanceStatus.ABSENT]: DANGER,
  [AttendanceStatus.LATE]: WARN,
  [AttendanceStatus.MEDICAL]: OK,
  [AttendanceStatus.WAIVED]: OK,
  [AttendanceStatus.HOLIDAY]: MUTED,
  [AttendanceStatus.CANCELED]: MUTED,
};

const ATTENDANCE_ICON: Record<AttendanceStatus, string> = {
  [AttendanceStatus.PRESENT]: "✅",
  [AttendanceStatus.ABSENT]: "❌",
  [AttendanceStatus.LATE]: "⏰",
  [AttendanceStatus.MEDICAL]: "🩺",
  [AttendanceStatus.WAIVED]: "🪪",
  [AttendanceStatus.HOLIDAY]: "🎉",
  [AttendanceStatus.CANCELED]: "🚫",
};

export function attendanceVisual(status: AttendanceStatus): AttendanceVisual {
  return {
    label: ATTENDANCE_LABEL[status],
    color: ATTENDANCE_COLOR[status],
    icon: ATTENDANCE_ICON[status],
  };
}

const MISS_STATUSES: readonly AttendanceStatus[] = [
  AttendanceStatus.ABSENT,
  AttendanceStatus.LATE,
];
const PRESENT_STATUSES: readonly AttendanceStatus[] = [
  AttendanceStatus.PRESENT,
  AttendanceStatus.MEDICAL,
  AttendanceStatus.WAIVED,
];

export function filterRecords(
  rows: readonly PresenceRow[],
  filter: PresenceFilter,
): PresenceRow[] {
  if (filter === "all") return [...rows];
  const allowed = filter === "misses" ? MISS_STATUSES : PRESENT_STATUSES;
  return rows.filter((row) => allowed.includes(row.record.status));
}

type KeyLabel = (row: PresenceRow) => { key: string; label: string };

const GROUPERS: Record<PresenceGrouping, KeyLabel> = {
  date: (row) => ({ key: row.record.day, label: formatDay(row.record.day) }),
  subject: (row) => ({ key: row.subject.id, label: row.subject.name }),
  status: (row) => ({
    key: row.record.status,
    label: ATTENDANCE_LABEL[row.record.status],
  }),
};

function sortGroups(
  groups: PresenceGroup[],
  by: PresenceGrouping,
): PresenceGroup[] {
  if (by === "date") {
    return groups.sort((left, right) => right.key.localeCompare(left.key));
  }
  return groups.sort((left, right) => left.label.localeCompare(right.label));
}

export function groupRecords(
  rows: readonly PresenceRow[],
  by: PresenceGrouping,
): PresenceGroup[] {
  const grouper = GROUPERS[by];
  const groups = new Map<string, PresenceGroup>();
  for (const row of rows) {
    const { key, label } = grouper(row);
    const group = groups.get(key);
    if (group) group.rows.push(row);
    else groups.set(key, { key, label, rows: [row] });
  }
  return sortGroups([...groups.values()], by);
}
