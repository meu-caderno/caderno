import { type Cipher, createEncryptedContextStore } from "@meu-caderno/core";
import {
  createInMemoryBlobStore,
  runStoreContract,
} from "@meu-caderno/core/testing";
import { beforeAll, describe, expect, it } from "vitest";
import { createCipher, generateKey, loadOrCreateCipher } from "./cipher";

let cipher: Cipher;

beforeAll(async () => {
  cipher = createCipher(await generateKey());
});

describe("libsodium cipher", () => {
  it("round-trips plaintext through encrypt/decrypt", async () => {
    const message = JSON.stringify({ name: "Cálculo I", grade: 9.5 });
    const envelope = await cipher.encrypt(message);
    expect(envelope).not.toContain("Cálculo");
    expect(await cipher.decrypt(envelope)).toBe(message);
  });

  it("produces a different envelope each time (random nonce)", async () => {
    const firstEnvelope = await cipher.encrypt("same");
    const secondEnvelope = await cipher.encrypt("same");
    expect(firstEnvelope).not.toBe(secondEnvelope);
    expect(await cipher.decrypt(firstEnvelope)).toBe("same");
    expect(await cipher.decrypt(secondEnvelope)).toBe("same");
  });

  it("loads or creates a key from a KeyStore", async () => {
    const saved: string[] = [];
    const keyStore = {
      load: async () => saved[0] ?? null,
      save: async (key: string) => {
        saved[0] = key;
      },
    };
    const first = await loadOrCreateCipher(keyStore);
    expect(saved).toHaveLength(1);
    const second = await loadOrCreateCipher(keyStore);
    expect(await second.decrypt(await first.encrypt("hello"))).toBe("hello");
  });

  it("backs an encrypted ContextStore that passes the contract", async () => {
    await runStoreContract(() =>
      createEncryptedContextStore(createInMemoryBlobStore(), cipher),
    );
  });
});
