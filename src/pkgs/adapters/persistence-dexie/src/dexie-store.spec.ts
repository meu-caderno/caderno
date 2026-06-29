import "fake-indexeddb/auto";
import { createEncryptedContextStore } from "@meu-caderno/core";
import { reversibleCipher, runStoreContract } from "@meu-caderno/core/testing";
import { describe, it } from "vitest";
import { createDexieBlobStore, createDexieContextStore } from "./dexie-store";

describe("createDexieContextStore", () => {
  it("passes the shared Store contract", async () => {
    let n = 0;
    await runStoreContract(() => {
      n += 1;
      return createDexieContextStore(`caderno-test-${n}`);
    });
  });
});

describe("createDexieBlobStore", () => {
  it("backs an encrypted ContextStore that passes the contract", async () => {
    let n = 0;
    await runStoreContract(() => {
      n += 1;
      return createEncryptedContextStore(
        createDexieBlobStore(`caderno-enc-test-${n}`),
        reversibleCipher,
      );
    });
  });
});
