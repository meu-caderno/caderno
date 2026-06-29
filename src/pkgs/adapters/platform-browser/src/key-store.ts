import type { KeyStore } from "@meu-caderno/core";

const DEFAULT_STORAGE_KEY = "caderno.crypto.key";

export function localStorageKeyStore(
  storageKey = DEFAULT_STORAGE_KEY,
): KeyStore {
  return {
    async load() {
      return globalThis.localStorage?.getItem(storageKey) ?? null;
    },
    async save(key) {
      globalThis.localStorage?.setItem(storageKey, key);
    },
  };
}
