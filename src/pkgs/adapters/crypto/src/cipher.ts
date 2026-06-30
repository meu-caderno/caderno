import type { Cipher, KeyStore } from "@meu-caderno/core";
import sodium from "libsodium-wrappers";

type Sodium = typeof sodium;

interface SodiumContext {
  sodiumApi: Sodium;
  key: Uint8Array;
}

const NONCE_SEPARATOR = ".";

let readyPromise: Promise<Sodium> | null = null;

function ready(): Promise<Sodium> {
  readyPromise ??= sodium.ready.then(() => sodium);
  return readyPromise;
}

export async function generateKey(): Promise<string> {
  const sodiumApi = await ready();
  return sodiumApi.to_base64(sodiumApi.crypto_secretbox_keygen());
}

export function createCipher(keyBase64: string): Cipher {
  let context: Promise<SodiumContext> | null = null;
  const initialize = () => {
    context ??= ready().then((sodiumApi) => ({
      sodiumApi,
      key: sodiumApi.from_base64(keyBase64),
    }));
    return context;
  };
  return {
    encrypt: async (plaintext) => {
      const { sodiumApi, key } = await initialize();
      const nonce = sodiumApi.randombytes_buf(
        sodiumApi.crypto_secretbox_NONCEBYTES,
      );
      const ciphertext = sodiumApi.crypto_secretbox_easy(
        sodiumApi.from_string(plaintext),
        nonce,
        key,
      );
      return `${sodiumApi.to_base64(nonce)}${NONCE_SEPARATOR}${sodiumApi.to_base64(ciphertext)}`;
    },
    decrypt: async (envelope) => {
      const { sodiumApi, key } = await initialize();
      const separator = envelope.indexOf(NONCE_SEPARATOR);
      if (separator === -1) {
        throw new Error(
          "envelope cifrado inválido: separador de nonce ausente",
        );
      }
      const nonce = sodiumApi.from_base64(envelope.slice(0, separator));
      const ciphertext = sodiumApi.from_base64(envelope.slice(separator + 1));
      return sodiumApi.to_string(
        sodiumApi.crypto_secretbox_open_easy(ciphertext, nonce, key),
      );
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
