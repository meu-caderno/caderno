import type { Caderno, Clock, IdGenerator } from "@meu-caderno/core";

export type CadernoRuntime = Caderno & {
  clock: Clock;
  ids: IdGenerator;
};

export function useCadernoService(): CadernoRuntime {
  return useNuxtApp().$caderno as CadernoRuntime;
}
