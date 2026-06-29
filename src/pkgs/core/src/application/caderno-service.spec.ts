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

  it("updates a subject and preserves its records when omitted", async () => {
    const { store, svc } = await service();
    const created = await svc.createSubject(subjectInput());
    if (!created.ok) throw new Error("setup failed");
    await svc.markAttendance({
      subjectId: created.value.id,
      day: "2026-03-01" as DayIso,
      status: AttendanceStatus.ABSENT,
    });
    const renamed = await svc.updateSubject({
      ...created.value,
      name: "Cálculo II",
      floor: 0.6,
    });
    expect(renamed.ok).toBe(true);
    const stored = await store.subjects.get(created.value.id);
    expect(stored?.name).toBe("Cálculo II");
    expect(stored?.floor).toBe(0.6);
    expect(
      await store.records.where((r) => r.subjectId === created.value.id),
    ).toHaveLength(1);
  });

  it("rejects updating a missing subject", async () => {
    const { svc } = await service();
    const r = await svc.updateSubject({
      ...subjectInput(),
      id: "ghost" as Id,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe(DomainErrorCode.NOT_FOUND);
  });

  it("creates a context that a subject can reference", async () => {
    const store = createInMemoryContextStore();
    const svc = createCadernoService({
      store,
      clock: fixedClock(1 as Timestamp, "2026-03-01" as DayIso),
      ids: counterIds("c"),
    });
    const ctx = await svc.createContext({ ...sampleContext() });
    expect(ctx.ok).toBe(true);
    if (!ctx.ok) return;
    expect(await store.oplog.forId(ctx.value.id)).toHaveLength(1);
    const sub = await svc.createSubject(
      subjectInput({ contextId: ctx.value.id }),
    );
    expect(sub.ok).toBe(true);
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

  it("upserts attendance for the same subject and day", async () => {
    const { store, svc } = await service();
    const subj = await svc.createSubject(subjectInput());
    if (!subj.ok) throw new Error("setup failed");
    await svc.markAttendance({
      subjectId: subj.value.id,
      day: "2026-03-01" as DayIso,
      status: AttendanceStatus.PRESENT,
    });
    await svc.markAttendance({
      subjectId: subj.value.id,
      day: "2026-03-01" as DayIso,
      status: AttendanceStatus.ABSENT,
    });
    const records = await store.records.where(
      (r) => r.subjectId === subj.value.id,
    );
    expect(records).toHaveLength(1);
    expect(records[0]?.status).toBe(AttendanceStatus.ABSENT);
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

  it("adds an assessment to a subject", async () => {
    const { svc } = await service();
    const subj = await svc.createSubject(subjectInput());
    if (!subj.ok) throw new Error("setup failed");
    const res = await svc.addAssessment(subj.value.id, {
      name: "P1",
      weight: 0.4,
    });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.assessments).toHaveLength(1);
      expect(res.value.assessments?.[0]?.name).toBe("P1");
    }
  });

  it("deletes an activity", async () => {
    const { store, svc } = await service();
    const subj = await svc.createSubject(subjectInput());
    if (!subj.ok) throw new Error("setup failed");
    await svc.upsertActivity(
      activity({ id: "act" as Id, subjectId: subj.value.id }),
    );
    expect(await store.activities.list()).toHaveLength(1);
    await svc.deleteActivity("act" as Id);
    expect(await store.activities.list()).toHaveLength(0);
  });

  it("adds, updates and deletes a library item", async () => {
    const { store, svc } = await service();
    const created = await svc.addLibraryItem({ title: "Cálculo Vol. 1" });
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    expect(await store.library.list()).toHaveLength(1);
    const updated = await svc.updateLibraryItem({
      ...created.value,
      stars: 5,
    });
    expect(updated.ok).toBe(true);
    expect((await store.library.get(created.value.id))?.stars).toBe(5);
    await svc.deleteLibraryItem(created.value.id);
    expect(await store.library.list()).toHaveLength(0);
  });

  it("rejects updating a missing library item", async () => {
    const { svc } = await service();
    const r = await svc.updateLibraryItem({ id: "ghost" as Id, title: "X" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe(DomainErrorCode.NOT_FOUND);
  });
});
