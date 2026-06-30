import { describe, expect, it } from "vitest";
import type { Color, Id, Timestamp } from "../domain";
import { EntityName, OpKind } from "../domain";
import {
  createInMemoryBlobStore,
  reversibleCipher,
  runStoreContract,
} from "../testing";
import { createEncryptedContextStore } from "./encrypted-store";

describe("createEncryptedContextStore", () => {
  it("passes the shared ContextStore contract", async () => {
    await runStoreContract(() =>
      createEncryptedContextStore(createInMemoryBlobStore(), reversibleCipher),
    );
  });

  it("persists only ciphertext in the underlying blob store", async () => {
    const blob = createInMemoryBlobStore();
    const store = createEncryptedContextStore(blob, reversibleCipher);
    await store.subjects.put({
      id: "s1" as Id,
      contextId: "c1" as Id,
      name: "Cálculo I",
      color: "#000000" as Color,
      hoursPerClass: 1,
      classesPerSession: 2,
    });

    const rows = await blob.subjects.list();
    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe("s1");
    expect(rows[0].data.startsWith("enc:")).toBe(true);
    expect(JSON.parse(await reversibleCipher.decrypt(rows[0].data)).name).toBe(
      "Cálculo I",
    );

    const restored = await store.subjects.get("s1" as Id);
    expect(restored?.name).toBe("Cálculo I");
  });

  it("decrypts oplog entries on read", async () => {
    const blob = createInMemoryBlobStore();
    const store = createEncryptedContextStore(blob, reversibleCipher);
    await store.oplog.append({
      timestamp: 5 as Timestamp,
      entity: EntityName.SUBJECT,
      op: OpKind.PUT,
      id: "s1" as Id,
    });

    expect(await store.oplog.since(1 as Timestamp)).toHaveLength(1);
    expect(await store.oplog.since(6 as Timestamp)).toHaveLength(0);
    expect(await store.oplog.forId("s1" as Id)).toHaveLength(1);
  });
});
