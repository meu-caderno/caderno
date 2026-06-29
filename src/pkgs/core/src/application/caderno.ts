import type {
  CapabilityManifest,
  CapabilityRegistry,
  Clock,
  ConfigStore,
  IdGenerator,
  StorageProvider,
} from "../domain";
import { createRegistry } from "../domain";
import { type CadernoService, createCadernoService } from "./caderno-service";
import { type CadernoHookBus, createCadernoHooks } from "./hooks";
import {
  createObservableStore,
  type ObservableContextStore,
} from "./observable-store";
import { type ConsentPolicy, loadPlugins, type Plugin } from "./plugins";

export interface CadernoConfig {
  configStore: ConfigStore;
  storage: StorageProvider;
  clock: Clock;
  ids: IdGenerator;
  plugins?: readonly Plugin[];
  consent?: ConsentPolicy;
}

export interface Caderno {
  service: CadernoService;
  capabilities: CapabilityRegistry;
  hooks: CadernoHookBus;
  plugins: readonly CapabilityManifest[];
  store: ObservableContextStore;
  config: ConfigStore;
}

export async function createCaderno(config: CadernoConfig): Promise<Caderno> {
  const { configStore, storage, clock, ids } = config;
  const store = createObservableStore(await storage.createContextStore());
  const registry = createRegistry();
  registry.register({ manifest: storage.manifest, list: () => [] });
  const hooks = createCadernoHooks();
  const service = createCadernoService({ store, clock, ids, hooks });
  const plugins = loadPlugins(
    config.plugins ?? [],
    { registry, store, config: configStore, clock, ids, service, hooks },
    config.consent,
  );
  return {
    service,
    capabilities: registry,
    hooks,
    plugins,
    store,
    config: configStore,
  };
}
