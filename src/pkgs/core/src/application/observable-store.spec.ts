import { describe, expect, it } from "vitest";
import type { Color, Id } from "../domain";
import { createInMemoryContextStore, runStoreContract } from "../testing";
import {
  createObservableStore,
  type EntityKey,
  type StoreChange,
} from "./observable-store";

const subject = (id: string) => ({
  id: id as Id,
  contextId: "ctx" as Id,
  name: "Cálculo",
  color: "#000000" as Color,
  hoursPerClass: 1,
  classesPerSession: 2,
});

describe("createObservableStore", () => {
  it("passes the shared ContextStore contract", async () => {
    await runStoreContract(() =>
      createObservableStore(createInMemoryContextStore()),
    );
  });

  it("is durable on ack: the inner store has the data without any flush", async () => {
    const inner = createInMemoryContextStore();
    const store = createObservableStore(inner);

    await store.transaction(async (tx) => {
      await tx.subjects.put(subject("s1"));
    });

    expect(await inner.subjects.get("s1" as Id)).toBeDefined();
  });

  it("emits the changed collections after a transaction commits", async () => {
    const store = createObservableStore(createInMemoryContextStore());
    const seen: EntityKey[][] = [];
    const off = store.subscribe((changed: StoreChange) =>
      seen.push([...changed]),
    );

    await store.transaction(async (tx) => {
      await tx.subjects.put(subject("s1"));
    });
    await store.subjects.put(subject("s2"));

    off();
    await store.subjects.put(subject("s3"));

    expect(seen).toEqual([["subjects"], ["subjects"]]);
  });

  it("does not emit when a transaction rolls back", async () => {
    const store = createObservableStore(createInMemoryContextStore());
    let emitted = 0;
    store.subscribe(() => {
      emitted += 1;
    });

    await expect(
      store.transaction(async (tx) => {
        await tx.subjects.put(subject("s1"));
        throw new Error("boom");
      }),
    ).rejects.toThrow();

    expect(emitted).toBe(0);
    expect(await store.subjects.get("s1" as Id)).toBeUndefined();
  });
});
