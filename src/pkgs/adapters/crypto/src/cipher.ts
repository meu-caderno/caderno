import type { Cipher, KeyStore } from "@meu-caderno/core";
import sodium from "libsodium-wrappers";

type Sodium = typeof sodium;

const NONCE_SEPARATOR = ".";

let readyPromise: Promise<Sodium> | null = null;

function ready(): Promise<Sodium> {
  readyPromise ??= sodium.ready.then(() => sodium);
  return readyPromise;
}

export async function generateKey(): Promise<string> {
  const s = await ready();
  return s.to_base64(s.crypto_secretbox_keygen());
}

export function createCipher(keyBase64: string): Cipher {
  let context: Promise<{ s: Sodium; key: Uint8Array }> | null = null;
  const init = () => {
    context ??= ready().then((s) => ({ s, key: s.from_base64(keyBase64) }));
    return context;
  };
  return {
    encrypt: async (plaintext) => {
      const { s, key } = await init();
      const nonce = s.randombytes_buf(s.crypto_secretbox_NONCEBYTES);
      const ciphertext = s.crypto_secretbox_easy(
        s.from_string(plaintext),
        nonce,
        key,
      );
      return `${s.to_base64(nonce)}${NONCE_SEPARATOR}${s.to_base64(ciphertext)}`;
    },
    decrypt: async (envelope) => {
      const { s, key } = await init();
      const separator = envelope.indexOf(NONCE_SEPARATOR);
      const nonce = s.from_base64(envelope.slice(0, separator));
      const ciphertext = s.from_base64(envelope.slice(separator + 1));
      return s.to_string(s.crypto_secretbox_open_easy(ciphertext, nonce, key));
    },
  };
}

export async function loadOrCreateCipher(keyStore: KeyStore): Promise<Cipher> {
  let keyBase64 = await keyStore.load();
  if (!keyBase64) {
    keyBase64 = await generateKey();
    await keyStore.save(keyBase64);
  }
  return createCipher(keyBase64);
}
