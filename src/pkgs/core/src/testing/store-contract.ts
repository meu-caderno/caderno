import { expect } from "vitest";
import type {
  Color,
  Context,
  ContextStore,
  Id,
  StudyMap,
  Subject,
  Timestamp,
} from "../domain";
import {
  AbsenceStance,
  EntityName,
  Goal,
  Link,
  MapItemKind,
  OpKind,
} from "../domain";
import { makeOp } from "../engine";

const id = (value: string) => value as Id;

function sampleContext(): Context {
  return {
    id: id("ctx"),
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
  };
}

function sampleSubject(): Subject {
  return {
    id: id("subj"),
    contextId: id("ctx"),
    name: "Cálculo",
    color: "#c0392b" as Color,
    hoursPerClass: 1,
    classesPerSession: 2,
  };
}

export async function runStoreContract(
  makeStore: () => ContextStore,
): Promise<void> {
  const store = makeStore();

  const context = sampleContext();
  await store.contexts.put(context);
  expect(await store.contexts.get(context.id)).toEqual(context);
  expect(await store.contexts.list()).toHaveLength(1);

  await store.transaction(async (tx) => {
    await tx.subjects.put(sampleSubject());
    await tx.oplog.append(
      makeOp(EntityName.SUBJECT, OpKind.PUT, id("subj"), 1 as Timestamp),
    );
  });
  expect(await store.subjects.get(id("subj"))).toBeDefined();
  expect(await store.oplog.forId(id("subj"))).toHaveLength(1);

  await expect(
    store.transaction(async (tx) => {
      await tx.subjects.put({ ...sampleSubject(), id: id("rollback") });
      await tx.oplog.append(
        makeOp(EntityName.SUBJECT, OpKind.PUT, id("rollback"), 2 as Timestamp),
      );
      throw new Error("boom");
    }),
  ).rejects.toThrow();

  expect(await store.subjects.get(id("rollback"))).toBeUndefined();
  expect(await store.oplog.forId(id("rollback"))).toHaveLength(0);

  await store.subjects.delete(id("subj"));
  expect(await store.subjects.get(id("subj"))).toBeUndefined();

  const map: StudyMap = {
    id: id("map"),
    name: "Roteiro",
    items: [{ kind: MapItemKind.SECTION, label: "Introdução" }],
  };
  await store.maps.put(map);
  expect(await store.maps.get(map.id)).toEqual(map);
  expect(await store.maps.list()).toHaveLength(1);
  await store.maps.delete(map.id);
  expect(await store.maps.get(map.id)).toBeUndefined();
}
