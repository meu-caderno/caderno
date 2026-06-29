import "fake-indexeddb/auto";
import { createEncryptedContextStore } from "@meu-caderno/core";
import { reversibleCipher, runStoreContract } from "@meu-caderno/core/testing";
import { describe, it } from "vitest";
import { createDexieBlobStore, createDexieContextStore } from "./dexie-store";

describe("createDexieContextStore", () => {
  it("passes the shared Store contract", async () => {
    let attempt = 0;
    await runStoreContract(() => {
      attempt += 1;
      return createDexieContextStore(`caderno-test-${attempt}`);
    });
  });
});

describe("createDexieBlobStore", () => {
  it("backs an encrypted ContextStore that passes the contract", async () => {
    let attempt = 0;
    await runStoreContract(() => {
      attempt += 1;
      return createEncryptedContextStore(
        createDexieBlobStore(`caderno-enc-test-${attempt}`),
        reversibleCipher,
      );
    });
  });
});
