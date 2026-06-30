import type { Caderno, Cipher, Clock, IdGenerator } from "@meu-caderno/core";

export type CadernoRuntime = Caderno & {
  clock: Clock;
  ids: IdGenerator;
  cipher: Cipher;
};

export function useCadernoService(): CadernoRuntime {
  return useNuxtApp().$caderno as CadernoRuntime;
}
