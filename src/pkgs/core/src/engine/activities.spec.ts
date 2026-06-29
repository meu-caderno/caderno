import { describe, expect, it } from "vitest";
import type { Activity, DayIso, Id } from "../domain";
import { ActivityKind, ActivityStatus, Recurrence, Root } from "../domain";
import {
  DueBucket,
  derivePrepDueDate,
  dueBucket,
  expandRecurrence,
  inboxItems,
  sortByDue,
  syncPreparesLinks,
  triage,
} from "./activities";

const d = (s: string) => s as DayIso;
const id = (s: string) => s as Id;
const act = (over: Partial<Activity> = {}): Activity => ({
  id: id("act"),
  title: "t",
  kind: ActivityKind.TASK,
  status: ActivityStatus.OPEN,
  root: Root.CONTEXT,
  ...over,
});

describe("expandRecurrence", () => {
  it("weekly series shares seriesId and mints fresh ids", () => {
    const occ = expandRecurrence(
      act({ dueDate: d("2026-03-02"), recurrence: Recurrence.WEEKLY }),
      { from: d("2026-03-01"), to: d("2026-03-30") },
      (i) => id(`gen-${i}`),
    );
    expect(occ).toHaveLength(5);
    expect(new Set(occ.map((o) => o.seriesId)).size).toBe(1);
    expect(occ[1]?.id).not.toBe(occ[0]?.id);
  });

  it("returns the activity unchanged when not recurring", () => {
    expect(
      expandRecurrence(
        act(),
        { from: d("2026-03-01"), to: d("2026-03-30") },
        () => id("x"),
      ),
    ).toHaveLength(1);
  });
});

describe("prepares link", () => {
  it("derivePrepDueDate subtracts the gap", () => {
    expect(derivePrepDueDate(d("2026-03-10"), 3)).toBe("2026-03-07");
  });

  it("syncPreparesLinks follows the target's dueDate", () => {
    const target = act({ id: id("exam"), dueDate: d("2026-03-10") });
    const prep = act({ id: id("study"), preparesId: id("exam"), gapDays: 3 });
    expect(
      syncPreparesLinks([target, prep]).find((a) => a.id === "study")?.dueDate,
    ).toBe("2026-03-07");
  });
});

describe("buckets / inbox / sort", () => {
  const today = d("2026-03-10");

  it("dueBucket classifies", () => {
    expect(dueBucket(act({ dueDate: d("2026-03-08") }), today)).toBe(
      DueBucket.OVERDUE,
    );
    expect(dueBucket(act({ dueDate: today }), today)).toBe(DueBucket.TODAY);
    expect(dueBucket(act({ dueDate: d("2026-03-12") }), today)).toBe(
      DueBucket.SOON,
    );
    expect(dueBucket(act({ dueDate: d("2026-03-30") }), today)).toBe(
      DueBucket.LATER,
    );
    expect(
      dueBucket(act({ dueDate: today, status: ActivityStatus.DONE }), today),
    ).toBe(DueBucket.NONE);
  });

  it("inbox, triage and sort", () => {
    expect(inboxItems([act({ root: Root.INBOX }), act()])).toHaveLength(1);
    expect(
      triage(act({ root: Root.INBOX }), {
        kind: ActivityKind.EXAM,
        contextId: id("c"),
      }).root,
    ).toBe(Root.CONTEXT);
    const sorted = sortByDue([
      act({ dueDate: d("2026-03-20") }),
      act({ dueDate: d("2026-03-05") }),
    ]);
    expect(sorted[0]?.dueDate).toBe("2026-03-05");
  });
});
