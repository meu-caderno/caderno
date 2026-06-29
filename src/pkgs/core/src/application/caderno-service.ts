import type {
  Activity,
  Record as AttendanceRecord,
  Clock,
  ContextStore,
  ContextTx,
  Grade,
  Id,
  IdGenerator,
  Repository,
  Subject,
} from "../domain";
import { EntityName, OpKind } from "../domain";
import { createsCycle, makeOp } from "../engine";
import { type DomainError, DomainErrorCode, domainError } from "./errors";
import type { CadernoHookBus } from "./hooks";
import { err, ok, type Result } from "./result";

export interface CadernoDeps {
  store: ContextStore;
  clock: Clock;
  ids: IdGenerator;
  hooks?: CadernoHookBus;
}

export interface CadernoService {
  createSubject(
    input: Omit<Subject, "id">,
  ): Promise<Result<Subject, DomainError>>;
  markAttendance(
    input: Omit<AttendanceRecord, "id">,
  ): Promise<Result<AttendanceRecord, DomainError>>;
  setGrade(
    subjectId: Id,
    assessmentId: Id,
    grade: Grade,
  ): Promise<Result<Subject, DomainError>>;
  upsertActivity(activity: Activity): Promise<Result<Activity, DomainError>>;
  deleteSubject(id: Id): Promise<Result<void, DomainError>>;
}

export function createCadernoService(deps: CadernoDeps): CadernoService {
  const { store, clock, ids, hooks } = deps;

  const fail = (
    code: DomainErrorCode,
    params?: Record<string, unknown>,
    entity?: EntityName,
  ): Result<never, DomainError> => err(domainError(code, params, entity));

  const commitPut = async <T extends { id: Id }>(
    select: (tx: ContextTx) => Repository<T>,
    entity: EntityName,
    value: T,
  ): Promise<void> => {
    const ts = await clock.now();
    await store.transaction(async (tx) => {
      await select(tx).put(value);
      await tx.oplog.append(makeOp(entity, OpKind.PUT, value.id, ts));
    });
  };

  return {
    async createSubject(input) {
      if (!(await store.contexts.get(input.contextId))) {
        return fail(
          DomainErrorCode.INVARIANT_FK_MISSING,
          { contextId: input.contextId },
          EntityName.SUBJECT,
        );
      }
      const subject: Subject = { ...input, id: await ids.newId() };
      await commitPut((tx) => tx.subjects, EntityName.SUBJECT, subject);
      await hooks?.callHook("subject:created", subject);
      return ok(subject);
    },

    async markAttendance(input) {
      const subject = await store.subjects.get(input.subjectId);
      if (!subject) {
        return fail(
          DomainErrorCode.INVARIANT_FK_MISSING,
          { subjectId: input.subjectId },
          EntityName.RECORD,
        );
      }
      const record: AttendanceRecord = { ...input, id: await ids.newId() };
      await commitPut((tx) => tx.records, EntityName.RECORD, record);
      await hooks?.callHook("attendance:marked", record);
      return ok(record);
    },

    async setGrade(subjectId, assessmentId, grade) {
      const subject = await store.subjects.get(subjectId);
      if (!subject) {
        return fail(
          DomainErrorCode.NOT_FOUND,
          { subjectId },
          EntityName.SUBJECT,
        );
      }
      const assessments = subject.assessments ?? [];
      if (!assessments.some((a) => a.id === assessmentId)) {
        return fail(
          DomainErrorCode.NOT_FOUND,
          { assessmentId },
          EntityName.SUBJECT,
        );
      }
      const updated: Subject = {
        ...subject,
        assessments: assessments.map((a) =>
          a.id === assessmentId ? { ...a, grade } : a,
        ),
      };
      await commitPut((tx) => tx.subjects, EntityName.SUBJECT, updated);
      await hooks?.callHook("grade:set", updated);
      return ok(updated);
    },

    async upsertActivity(activity) {
      if (
        activity.contextId &&
        !(await store.contexts.get(activity.contextId))
      ) {
        return fail(
          DomainErrorCode.INVARIANT_FK_MISSING,
          { contextId: activity.contextId },
          EntityName.ACTIVITY,
        );
      }
      if (
        activity.subjectId &&
        !(await store.subjects.get(activity.subjectId))
      ) {
        return fail(
          DomainErrorCode.INVARIANT_FK_MISSING,
          { subjectId: activity.subjectId },
          EntityName.ACTIVITY,
        );
      }
      if (activity.preparesId) {
        const edges = (await store.activities.list())
          .filter((a) => a.id !== activity.id && a.preparesId !== undefined)
          .map((a) => ({ from: a.id, to: a.preparesId as Id }));
        if (createsCycle(edges, activity.id, activity.preparesId)) {
          return fail(
            DomainErrorCode.INVARIANT_CYCLE,
            { activityId: activity.id, preparesId: activity.preparesId },
            EntityName.ACTIVITY,
          );
        }
      }
      await commitPut((tx) => tx.activities, EntityName.ACTIVITY, activity);
      await hooks?.callHook("activity:upserted", activity);
      return ok(activity);
    },

    async deleteSubject(id) {
      const subject = await store.subjects.get(id);
      if (!subject) {
        return fail(DomainErrorCode.NOT_FOUND, { id }, EntityName.SUBJECT);
      }
      const records = await store.records.where((r) => r.subjectId === id);
      const activities = await store.activities.where(
        (a) => a.subjectId === id,
      );
      const ts = await clock.now();
      await store.transaction(async (tx) => {
        for (const r of records) {
          await tx.records.delete(r.id);
          await tx.oplog.append(
            makeOp(EntityName.RECORD, OpKind.DELETE, r.id, ts),
          );
        }
        for (const a of activities) {
          await tx.activities.delete(a.id);
          await tx.oplog.append(
            makeOp(EntityName.ACTIVITY, OpKind.DELETE, a.id, ts),
          );
        }
        await tx.subjects.delete(id);
        await tx.oplog.append(
          makeOp(EntityName.SUBJECT, OpKind.DELETE, id, ts),
        );
      });
      await hooks?.callHook("subject:deleted", id);
      return ok(undefined);
    },
  };
}
