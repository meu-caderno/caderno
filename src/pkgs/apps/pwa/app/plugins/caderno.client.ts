import {
  browserClock,
  localStorageKeyStore,
  uuidIdGenerator,
} from "@meu-caderno/adapter-browser";
import { loadOrCreateCipher } from "@meu-caderno/adapter-crypto";
import {
  createDexieBlobStore,
  createDexieConfigStore,
} from "@meu-caderno/adapter-dexie";
import {
  createCaderno,
  encryptedStorageProvider,
  type Plugin,
} from "@meu-caderno/core";

const plugins: Plugin[] = [];

export default defineNuxtPlugin(async () => {
  const clock = browserClock();
  const ids = uuidIdGenerator();
  const cipher = await loadOrCreateCipher(localStorageKeyStore());
  const caderno = await createCaderno({
    configStore: createDexieConfigStore("caderno-config"),
    storage: encryptedStorageProvider(
      () => createDexieBlobStore("caderno-enc"),
      cipher,
    ),
    clock,
    ids,
    plugins,
  });

  return { provide: { caderno: { ...caderno, clock, ids } } };
});
