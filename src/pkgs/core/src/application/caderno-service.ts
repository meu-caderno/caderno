import type {
  Activity,
  Assessment,
  Record as AttendanceRecord,
  Clock,
  Context,
  ContextStore,
  ContextTx,
  Edge,
  Grade,
  Id,
  Identified,
  IdGenerator,
  LibraryItem,
  Node,
  Repository,
  Subject,
} from "../domain";
import { type EdgeKind, EntityName, OpKind } from "../domain";
import { canReparent, createsCycle, makeOp } from "../engine";
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
  createContext(
    input: Omit<Context, "id">,
  ): Promise<Result<Context, DomainError>>;
  updateContext(context: Context): Promise<Result<Context, DomainError>>;
  createSubject(
    input: Omit<Subject, "id">,
  ): Promise<Result<Subject, DomainError>>;
  updateSubject(subject: Subject): Promise<Result<Subject, DomainError>>;
  markAttendance(
    input: Omit<AttendanceRecord, "id">,
  ): Promise<Result<AttendanceRecord, DomainError>>;
  addAssessment(
    subjectId: Id,
    input: Omit<Assessment, "id" | "subjectId">,
  ): Promise<Result<Subject, DomainError>>;
  setGrade(
    subjectId: Id,
    assessmentId: Id,
    grade: Grade,
  ): Promise<Result<Subject, DomainError>>;
  upsertActivity(activity: Activity): Promise<Result<Activity, DomainError>>;
  deleteActivity(id: Id): Promise<Result<void, DomainError>>;
  deleteSubject(id: Id): Promise<Result<void, DomainError>>;
  addLibraryItem(
    input: Omit<LibraryItem, "id">,
  ): Promise<Result<LibraryItem, DomainError>>;
  updateLibraryItem(
    item: LibraryItem,
  ): Promise<Result<LibraryItem, DomainError>>;
  deleteLibraryItem(id: Id): Promise<Result<void, DomainError>>;
  createNode(input: Omit<Node, "id">): Promise<Result<Node, DomainError>>;
  updateNode(node: Node): Promise<Result<Node, DomainError>>;
  deleteNode(id: Id): Promise<Result<void, DomainError>>;
  linkNodes(
    from: Id,
    to: Id,
    kind: EdgeKind,
  ): Promise<Result<Edge, DomainError>>;
  unlinkNodes(id: Id): Promise<Result<void, DomainError>>;
}

export function createCadernoService(deps: CadernoDeps): CadernoService {
  const { store, clock, ids, hooks } = deps;

  const fail = (
    code: DomainErrorCode,
    params?: Record<string, unknown>,
    entity?: EntityName,
  ): Result<never, DomainError> => err(domainError(code, params, entity));

  const commitPut = async <T extends Identified>(
    select: (tx: ContextTx) => Repository<T>,
    entity: EntityName,
    value: T,
  ): Promise<void> => {
    const timestamp = await clock.now();
    await store.transaction(async (tx) => {
      await select(tx).put(value);
      await tx.oplog.append(makeOp(entity, OpKind.PUT, value.id, timestamp));
    });
  };

  const commitDelete = async <T extends Identified>(
    select: (tx: ContextTx) => Repository<T>,
    entity: EntityName,
    id: Id,
  ): Promise<void> => {
    const timestamp = await clock.now();
    await store.transaction(async (tx) => {
      await select(tx).delete(id);
      await tx.oplog.append(makeOp(entity, OpKind.DELETE, id, timestamp));
    });
  };

  const activityFormsCycle = async (activity: Activity): Promise<boolean> => {
    if (!activity.preparesId) return false;
    const edges = (await store.activities.list())
      .filter(
        (other) => other.id !== activity.id && other.preparesId !== undefined,
      )
      .map((other) => ({ from: other.id, to: other.preparesId as Id }));
    return createsCycle(edges, activity.id, activity.preparesId);
  };

  return {
    async createContext(input) {
      const context: Context = { ...input, id: await ids.newId() };
      await commitPut((tx) => tx.contexts, EntityName.CONTEXT, context);
      await hooks?.callHook("context:created", context);
      return ok(context);
    },

    async updateContext(context) {
      if (!(await store.contexts.get(context.id))) {
        return fail(
          DomainErrorCode.NOT_FOUND,
          { id: context.id },
          EntityName.CONTEXT,
        );
      }
      await commitPut((tx) => tx.contexts, EntityName.CONTEXT, context);
      await hooks?.callHook("context:updated", context);
      return ok(context);
    },

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

    async updateSubject(subject) {
      const existing = await store.subjects.get(subject.id);
      if (!existing) {
        return fail(
          DomainErrorCode.NOT_FOUND,
          { id: subject.id },
          EntityName.SUBJECT,
        );
      }
      if (!(await store.contexts.get(subject.contextId))) {
        return fail(
          DomainErrorCode.INVARIANT_FK_MISSING,
          { contextId: subject.contextId },
          EntityName.SUBJECT,
        );
      }
      const merged: Subject = {
        ...subject,
        assessments: subject.assessments ?? existing.assessments,
        records: subject.records ?? existing.records,
      };
      await commitPut((tx) => tx.subjects, EntityName.SUBJECT, merged);
      await hooks?.callHook("subject:updated", merged);
      return ok(merged);
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
      const existing = (
        await store.records.where(
          (record) =>
            record.subjectId === input.subjectId && record.day === input.day,
        )
      )[0];
      const record: AttendanceRecord = existing
        ? { ...existing, ...input }
        : { ...input, id: await ids.newId() };
      await commitPut((tx) => tx.records, EntityName.RECORD, record);
      await hooks?.callHook("attendance:marked", record);
      return ok(record);
    },

    async addAssessment(subjectId, input) {
      const subject = await store.subjects.get(subjectId);
      if (!subject) {
        return fail(
          DomainErrorCode.NOT_FOUND,
          { subjectId },
          EntityName.SUBJECT,
        );
      }
      const assessment: Assessment = {
        ...input,
        id: await ids.newId(),
        subjectId,
      };
      const updated: Subject = {
        ...subject,
        assessments: [...(subject.assessments ?? []), assessment],
      };
      await commitPut((tx) => tx.subjects, EntityName.SUBJECT, updated);
      await hooks?.callHook("grade:set", updated);
      return ok(updated);
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
      if (!assessments.some((assessment) => assessment.id === assessmentId)) {
        return fail(
          DomainErrorCode.NOT_FOUND,
          { assessmentId },
          EntityName.SUBJECT,
        );
      }
      const updated: Subject = {
        ...subject,
        assessments: assessments.map((assessment) =>
          assessment.id === assessmentId
            ? { ...assessment, grade }
            : assessment,
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
      if (await activityFormsCycle(activity)) {
        return fail(
          DomainErrorCode.INVARIANT_CYCLE,
          { activityId: activity.id, preparesId: activity.preparesId },
          EntityName.ACTIVITY,
        );
      }
      await commitPut((tx) => tx.activities, EntityName.ACTIVITY, activity);
      await hooks?.callHook("activity:upserted", activity);
      return ok(activity);
    },

    async deleteActivity(id) {
      const activity = await store.activities.get(id);
      if (!activity) {
        return fail(DomainErrorCode.NOT_FOUND, { id }, EntityName.ACTIVITY);
      }
      await commitDelete((tx) => tx.activities, EntityName.ACTIVITY, id);
      return ok(undefined);
    },

    async deleteSubject(id) {
      const subject = await store.subjects.get(id);
      if (!subject) {
        return fail(DomainErrorCode.NOT_FOUND, { id }, EntityName.SUBJECT);
      }
      const records = await store.records.where(
        (record) => record.subjectId === id,
      );
      const activities = await store.activities.where(
        (activity) => activity.subjectId === id,
      );
      const timestamp = await clock.now();
      await store.transaction(async (tx) => {
        for (const record of records) {
          await tx.records.delete(record.id);
          await tx.oplog.append(
            makeOp(EntityName.RECORD, OpKind.DELETE, record.id, timestamp),
          );
        }
        for (const activity of activities) {
          await tx.activities.delete(activity.id);
          await tx.oplog.append(
            makeOp(EntityName.ACTIVITY, OpKind.DELETE, activity.id, timestamp),
          );
        }
        await tx.subjects.delete(id);
        await tx.oplog.append(
          makeOp(EntityName.SUBJECT, OpKind.DELETE, id, timestamp),
        );
      });
      await hooks?.callHook("subject:deleted", id);
      return ok(undefined);
    },

    async addLibraryItem(input) {
      const item: LibraryItem = { ...input, id: await ids.newId() };
      await commitPut((tx) => tx.library, EntityName.LIBRARY, item);
      await hooks?.callHook("library:changed", item);
      return ok(item);
    },

    async updateLibraryItem(item) {
      if (!(await store.library.get(item.id))) {
        return fail(
          DomainErrorCode.NOT_FOUND,
          { id: item.id },
          EntityName.LIBRARY,
        );
      }
      await commitPut((tx) => tx.library, EntityName.LIBRARY, item);
      await hooks?.callHook("library:changed", item);
      return ok(item);
    },

    async deleteLibraryItem(id) {
      const item = await store.library.get(id);
      if (!item) {
        return fail(DomainErrorCode.NOT_FOUND, { id }, EntityName.LIBRARY);
      }
      await commitDelete((tx) => tx.library, EntityName.LIBRARY, id);
      return ok(undefined);
    },

    async createNode(input) {
      if (input.parentId && !(await store.graph.nodes.get(input.parentId))) {
        return fail(
          DomainErrorCode.INVARIANT_FK_MISSING,
          { parentId: input.parentId },
          EntityName.NODE,
        );
      }
      const node: Node = { ...input, id: await ids.newId() };
      await commitPut((tx) => tx.graph.nodes, EntityName.NODE, node);
      await hooks?.callHook("node:upserted", node);
      return ok(node);
    },

    async updateNode(node) {
      if (!(await store.graph.nodes.get(node.id))) {
        return fail(
          DomainErrorCode.NOT_FOUND,
          { id: node.id },
          EntityName.NODE,
        );
      }
      if (node.parentId) {
        if (!(await store.graph.nodes.get(node.parentId))) {
          return fail(
            DomainErrorCode.INVARIANT_FK_MISSING,
            { parentId: node.parentId },
            EntityName.NODE,
          );
        }
        const nodes = await store.graph.nodes.list();
        if (!canReparent(nodes, node.id, node.parentId)) {
          return fail(
            DomainErrorCode.INVARIANT_CYCLE,
            { id: node.id, parentId: node.parentId },
            EntityName.NODE,
          );
        }
      }
      await commitPut((tx) => tx.graph.nodes, EntityName.NODE, node);
      await hooks?.callHook("node:upserted", node);
      return ok(node);
    },

    async deleteNode(id) {
      const node = await store.graph.nodes.get(id);
      if (!node) {
        return fail(DomainErrorCode.NOT_FOUND, { id }, EntityName.NODE);
      }
      const children = await store.graph.childrenOf(id);
      const incident = [
        ...(await store.graph.edgesFrom(id)),
        ...(await store.graph.edgesTo(id)),
      ];
      const timestamp = await clock.now();
      await store.transaction(async (tx) => {
        for (const child of children) {
          await tx.graph.nodes.put({ ...child, parentId: node.parentId });
          await tx.oplog.append(
            makeOp(EntityName.NODE, OpKind.PUT, child.id, timestamp),
          );
        }
        for (const edge of incident) {
          await tx.graph.edges.delete(edge.id);
          await tx.oplog.append(
            makeOp(EntityName.EDGE, OpKind.DELETE, edge.id, timestamp),
          );
        }
        await tx.graph.nodes.delete(id);
        await tx.oplog.append(
          makeOp(EntityName.NODE, OpKind.DELETE, id, timestamp),
        );
      });
      await hooks?.callHook("node:deleted", id);
      return ok(undefined);
    },

    async linkNodes(from, to, kind) {
      if (from === to) {
        return fail(
          DomainErrorCode.INVARIANT_CYCLE,
          { from, to },
          EntityName.EDGE,
        );
      }
      if (!(await store.graph.nodes.get(from))) {
        return fail(
          DomainErrorCode.INVARIANT_FK_MISSING,
          { from },
          EntityName.EDGE,
        );
      }
      if (!(await store.graph.nodes.get(to))) {
        return fail(
          DomainErrorCode.INVARIANT_FK_MISSING,
          { to },
          EntityName.EDGE,
        );
      }
      const existing = (await store.graph.edgesFrom(from)).find(
        (edge) => edge.to === to && edge.kind === kind,
      );
      if (existing) return ok(existing);
      const edge: Edge = { id: await ids.newId(), from, to, kind };
      await commitPut((tx) => tx.graph.edges, EntityName.EDGE, edge);
      await hooks?.callHook("edge:upserted", edge);
      return ok(edge);
    },

    async unlinkNodes(id) {
      if (!(await store.graph.edges.get(id))) {
        return fail(DomainErrorCode.NOT_FOUND, { id }, EntityName.EDGE);
      }
      await commitDelete((tx) => tx.graph.edges, EntityName.EDGE, id);
      return ok(undefined);
    },
  };
}
