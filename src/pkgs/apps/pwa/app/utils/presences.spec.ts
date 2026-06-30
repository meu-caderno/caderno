import type { AttendanceRecord, Id, Subject } from "@meu-caderno/core";
import { AttendanceStatus } from "@meu-caderno/core";
import { describe, expect, it } from "vitest";
import { filterRecords, groupRecords, type PresenceRow } from "./presences";

const id = (value: string) => value as Id;

function subject(name: string): Subject {
  return {
    id: id(`s-${name}`),
    contextId: id("ctx"),
    name,
    color: "#000000" as Subject["color"],
    hoursPerClass: 2,
    classesPerSession: 1,
  };
}

function row(
  subjectName: string,
  day: string,
  status: AttendanceStatus,
): PresenceRow {
  const record: AttendanceRecord = {
    id: id(`${subjectName}-${day}-${status}`),
    subjectId: id(`s-${subjectName}`),
    day: day as AttendanceRecord["day"],
    status,
  };
  return { record, subject: subject(subjectName) };
}

const rows: PresenceRow[] = [
  row("Cálculo", "2026-06-01", AttendanceStatus.PRESENT),
  row("Cálculo", "2026-06-02", AttendanceStatus.ABSENT),
  row("Física", "2026-06-02", AttendanceStatus.LATE),
  row("Física", "2026-06-03", AttendanceStatus.MEDICAL),
  row("Física", "2026-06-04", AttendanceStatus.WAIVED),
  row("Física", "2026-06-05", AttendanceStatus.HOLIDAY),
];

describe("filterRecords", () => {
  it("returns every row for the all filter", () => {
    expect(filterRecords(rows, "all")).toHaveLength(rows.length);
  });

  it("keeps only absences and lates for the misses filter", () => {
    const statuses = filterRecords(rows, "misses").map((r) => r.record.status);
    expect(statuses).toEqual([AttendanceStatus.ABSENT, AttendanceStatus.LATE]);
  });

  it("keeps present, medical and waived for the present filter", () => {
    const statuses = filterRecords(rows, "present").map((r) => r.record.status);
    expect(statuses).toEqual([
      AttendanceStatus.PRESENT,
      AttendanceStatus.MEDICAL,
      AttendanceStatus.WAIVED,
    ]);
  });

  it("does not mutate the source array", () => {
    filterRecords(rows, "misses");
    expect(rows).toHaveLength(6);
  });
});

describe("groupRecords", () => {
  it("groups by date sorted from newest to oldest", () => {
    const groups = groupRecords(rows, "date");
    expect(groups.map((g) => g.key)).toEqual([
      "2026-06-05",
      "2026-06-04",
      "2026-06-03",
      "2026-06-02",
      "2026-06-01",
    ]);
    const june2 = groups.find((g) => g.key === "2026-06-02");
    expect(june2?.rows).toHaveLength(2);
  });

  it("groups by subject sorted alphabetically by label", () => {
    const groups = groupRecords(rows, "subject");
    expect(groups.map((g) => g.label)).toEqual(["Cálculo", "Física"]);
    expect(groups[0]?.rows).toHaveLength(2);
    expect(groups[1]?.rows).toHaveLength(4);
  });

  it("groups by status using the localized label", () => {
    const groups = groupRecords(rows, "status");
    const byKey = new Map(groups.map((g) => [g.key, g]));
    expect(byKey.get(AttendanceStatus.PRESENT)?.label).toBe("Presente");
    expect(byKey.get(AttendanceStatus.ABSENT)?.rows).toHaveLength(1);
    expect(byKey.get(AttendanceStatus.HOLIDAY)?.label).toBe("Feriado");
  });

  it("returns an empty array when there are no rows", () => {
    expect(groupRecords([], "date")).toEqual([]);
  });
});
