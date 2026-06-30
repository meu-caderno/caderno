import type { Activity, DayIso, Id, Subject } from "@meu-caderno/core";
import { ActivityKind, ActivityStatus, Root } from "@meu-caderno/core";
import { describe, expect, it } from "vitest";
import { filterActivities, groupActivities } from "./activities-filter";

const id = (value: string) => value as Id;
const day = (value: string) => value as DayIso;
const TODAY = day("2026-06-30");

function activity(patch: Partial<Activity> = {}): Activity {
  return {
    id: id(patch.title ?? "a"),
    title: patch.title ?? "Atividade",
    kind: ActivityKind.TASK,
    status: ActivityStatus.OPEN,
    root: Root.CONTEXT,
    ...patch,
  };
}

function subject(value: string, name: string): Subject {
  return { id: id(value), name } as Subject;
}

describe("filterActivities", () => {
  const rows = [
    activity({ title: "open", status: ActivityStatus.OPEN }),
    activity({ title: "done", status: ActivityStatus.DONE }),
    activity({ title: "archived", status: ActivityStatus.ARCHIVED }),
  ];

  it("returns a copy of every row for 'all'", () => {
    const result = filterActivities(rows, "all");
    expect(result).toHaveLength(3);
    expect(result).not.toBe(rows);
  });

  it("keeps only open activities for 'open'", () => {
    const result = filterActivities(rows, "open");
    expect(result.map((row) => row.status)).toEqual([ActivityStatus.OPEN]);
  });

  it("keeps only done activities for 'done'", () => {
    const result = filterActivities(rows, "done");
    expect(result.map((row) => row.status)).toEqual([ActivityStatus.DONE]);
  });
});

describe("groupActivities by due", () => {
  it("buckets activities by deadline and drops empty groups", () => {
    const rows = [
      activity({ title: "late", dueDate: day("2026-06-28") }),
      activity({ title: "today", dueDate: TODAY }),
      activity({ title: "none" }),
    ];
    const groups = groupActivities(rows, "due", { today: TODAY });
    expect(groups.map((group) => group.key)).toEqual([
      "OVERDUE",
      "TODAY",
      "NONE",
    ]);
    expect(groups[0]?.label).toBe("Atrasadas");
  });
});

describe("groupActivities by subject", () => {
  it("groups by subject and labels with the subject name", () => {
    const rows = [
      activity({ title: "math1", subjectId: id("m") }),
      activity({ title: "math2", subjectId: id("m") }),
      activity({ title: "loose" }),
    ];
    const groups = groupActivities(rows, "subject", {
      subjects: [subject("m", "Matemática")],
    });
    expect(groups).toHaveLength(2);
    expect(groups[0]).toMatchObject({ label: "Matemática" });
    expect(groups[0]?.rows).toHaveLength(2);
    expect(groups[1]?.label).toBe("Sem disciplina");
  });
});

describe("groupActivities by kind", () => {
  it("groups by kind with readable labels", () => {
    const rows = [
      activity({ title: "exam", kind: ActivityKind.EXAM }),
      activity({ title: "task", kind: ActivityKind.TASK }),
    ];
    const groups = groupActivities(rows, "kind");
    expect(groups.map((group) => group.label)).toEqual(["Provas", "Tarefas"]);
  });
});
