import { describe, expect, it } from "vitest";
import type { Activity, DayIso, Id } from "../domain";
import { ActivityKind, ActivityStatus, Recurrence, Root } from "../domain";
import {
  DueBucket,
  derivePrepDueDate,
  dueBucket,
  expandRecurrence,
  inboxItems,
  nextRecurrence,
  sortByDue,
  syncPreparesLinks,
  triage,
} from "./activities";

const asDay = (value: string) => value as DayIso;
const id = (value: string) => value as Id;
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
      act({ dueDate: asDay("2026-03-02"), recurrence: Recurrence.WEEKLY }),
      { from: asDay("2026-03-01"), to: asDay("2026-03-30") },
      (index) => id(`gen-${index}`),
    );
    expect(occ).toHaveLength(5);
    expect(new Set(occ.map((occurrence) => occurrence.seriesId)).size).toBe(1);
    expect(occ[1]?.id).not.toBe(occ[0]?.id);
  });

  it("returns the activity unchanged when not recurring", () => {
    expect(
      expandRecurrence(
        act(),
        { from: asDay("2026-03-01"), to: asDay("2026-03-30") },
        () => id("x"),
      ),
    ).toHaveLength(1);
  });
});

describe("nextRecurrence", () => {
  it("advances a weekly activity by 7 days and shares the series", () => {
    const next = nextRecurrence(
      act({ dueDate: asDay("2026-03-02"), recurrence: Recurrence.WEEKLY }),
      id("gen"),
    );
    expect(next?.dueDate).toBe("2026-03-09");
    expect(next?.seriesId).toBe("act");
    expect(next?.status).toBe(ActivityStatus.OPEN);
  });

  it("advances a biweekly activity by 14 days", () => {
    const next = nextRecurrence(
      act({ dueDate: asDay("2026-03-02"), recurrence: Recurrence.BIWEEKLY }),
      id("gen"),
    );
    expect(next?.dueDate).toBe("2026-03-16");
  });

  it("returns null when not recurring or without a due date", () => {
    expect(
      nextRecurrence(act({ dueDate: asDay("2026-03-02") }), id("x")),
    ).toBeNull();
    expect(
      nextRecurrence(act({ recurrence: Recurrence.WEEKLY }), id("x")),
    ).toBeNull();
  });

  it("stops the series once the next date passes recurrenceUntil", () => {
    expect(
      nextRecurrence(
        act({
          dueDate: asDay("2026-03-02"),
          recurrence: Recurrence.WEEKLY,
          recurrenceUntil: asDay("2026-03-08"),
        }),
        id("gen"),
      ),
    ).toBeNull();
  });

  it("keeps generating while within recurrenceUntil", () => {
    const next = nextRecurrence(
      act({
        dueDate: asDay("2026-03-02"),
        recurrence: Recurrence.WEEKLY,
        recurrenceUntil: asDay("2026-03-09"),
      }),
      id("gen"),
    );
    expect(next?.dueDate).toBe("2026-03-09");
  });

  it("resets subtasks on the next occurrence", () => {
    const next = nextRecurrence(
      act({
        dueDate: asDay("2026-03-02"),
        recurrence: Recurrence.WEEKLY,
        subtasks: [{ id: id("s1"), text: "ler", done: true }],
      }),
      id("gen"),
    );
    expect(next?.subtasks?.[0]?.done).toBe(false);
  });
});

describe("prepares link", () => {
  it("derivePrepDueDate subtracts the gap", () => {
    expect(derivePrepDueDate(asDay("2026-03-10"), 3)).toBe("2026-03-07");
  });

  it("syncPreparesLinks follows the target's dueDate", () => {
    const target = act({ id: id("exam"), dueDate: asDay("2026-03-10") });
    const prep = act({ id: id("study"), preparesId: id("exam"), gapDays: 3 });
    expect(
      syncPreparesLinks([target, prep]).find(
        (activity) => activity.id === "study",
      )?.dueDate,
    ).toBe("2026-03-07");
  });
});

describe("buckets / inbox / sort", () => {
  const today = asDay("2026-03-10");

  it("dueBucket classifies", () => {
    expect(dueBucket(act({ dueDate: asDay("2026-03-08") }), today)).toBe(
      DueBucket.OVERDUE,
    );
    expect(dueBucket(act({ dueDate: today }), today)).toBe(DueBucket.TODAY);
    expect(dueBucket(act({ dueDate: asDay("2026-03-12") }), today)).toBe(
      DueBucket.SOON,
    );
    expect(dueBucket(act({ dueDate: asDay("2026-03-30") }), today)).toBe(
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
      act({ dueDate: asDay("2026-03-20") }),
      act({ dueDate: asDay("2026-03-05") }),
    ]);
    expect(sorted[0]?.dueDate).toBe("2026-03-05");
  });
});
