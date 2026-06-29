import { describe, expect, it } from "vitest";
import type {
  Activity,
  Color,
  Context,
  DayIso,
  Id,
  Subject,
  Timestamp,
} from "../domain";
import {
  AbsenceStance,
  ActivityKind,
  ActivityStatus,
  AttendanceStatus,
  Goal,
  Link,
  Root,
} from "../domain";
import {
  counterIds,
  createInMemoryContextStore,
  fixedClock,
  runStoreContract,
} from "../testing";
import { createCadernoService } from "./caderno-service";
import { DomainErrorCode } from "./errors";

const sampleContext = (): Context => ({
  id: "ctx" as Id,
  name: "Faculdade",
  goal: Goal.UNIVERSITY,
  link: Link.PERSONAL,
  absenceStance: AbsenceStance.PLAN_ABSENCES,
  modules: {
    attendance: true,
    grades: true,
    term: true,
    streak: false,
    hours: false,
    syllabus: false,
    certificate: false,
  },
});

async function service() {
  const store = createInMemoryContextStore();
  await store.contexts.put(sampleContext());
  const svc = createCadernoService({
    store,
    clock: fixedClock(1000 as Timestamp, "2026-03-01" as DayIso),
    ids: counterIds("g"),
  });
  return { store, svc };
}

const subjectInput = (over: Partial<Subject> = {}): Omit<Subject, "id"> => ({
  contextId: "ctx" as Id,
  name: "Cálculo",
  color: "#c0392b" as Color,
  hoursPerClass: 1,
  classesPerSession: 2,
  ...over,
});

describe("store contract (in-memory)", () => {
  it("passes the shared Store contract", async () => {
    await runStoreContract(createInMemoryContextStore);
  });
});

describe("CadernoService", () => {
  it("creates a subject and appends an oplog entry", async () => {
    const { store, svc } = await service();
    const r = await svc.createSubject(subjectInput());
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(await store.subjects.get(r.value.id)).toBeDefined();
      expect(await store.oplog.forId(r.value.id)).toHaveLength(1);
    }
  });

  it("rejects attendance for a missing subject", async () => {
    const { svc } = await service();
    const r = await svc.markAttendance({
      subjectId: "nope" as Id,
      day: "2026-03-01" as DayIso,
      status: AttendanceStatus.PRESENT,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe(DomainErrorCode.INVARIANT_FK_MISSING);
  });

  it("rejects a subject whose context does not exist", async () => {
    const { svc } = await service();
    const r = await svc.createSubject(
      subjectInput({ contextId: "nope" as Id }),
    );
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe(DomainErrorCode.INVARIANT_FK_MISSING);
  });

  const activity = (over: Partial<Activity>): Activity => ({
    id: "a1" as Id,
    title: "Tarefa",
    kind: ActivityKind.TASK,
    status: ActivityStatus.OPEN,
    root: Root.CONTEXT,
    ...over,
  });

  it("rejects an activity that prepares itself (cycle)", async () => {
    const { svc } = await service();
    const r = await svc.upsertActivity(
      activity({ id: "a1" as Id, preparesId: "a1" as Id }),
    );
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe(DomainErrorCode.INVARIANT_CYCLE);
  });

  it("rejects a prepares chain that closes a cycle", async () => {
    const { svc } = await service();
    await svc.upsertActivity(
      activity({ id: "a1" as Id, preparesId: "a2" as Id }),
    );
    const r = await svc.upsertActivity(
      activity({ id: "a2" as Id, preparesId: "a1" as Id }),
    );
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe(DomainErrorCode.INVARIANT_CYCLE);
  });

  it("cascades records and activities when deleting a subject", async () => {
    const { store, svc } = await service();
    const created = await svc.createSubject(subjectInput());
    if (!created.ok) throw new Error("setup failed");
    await svc.markAttendance({
      subjectId: created.value.id,
      day: "2026-03-01" as DayIso,
      status: AttendanceStatus.ABSENT,
    });
    await svc.upsertActivity(
      activity({ id: "act" as Id, subjectId: created.value.id }),
    );
    expect(await store.records.list()).toHaveLength(1);
    expect(await store.activities.list()).toHaveLength(1);
    await svc.deleteSubject(created.value.id);
    expect(await store.subjects.get(created.value.id)).toBeUndefined();
    expect(await store.records.list()).toHaveLength(0);
    expect(await store.activities.list()).toHaveLength(0);
  });
});
