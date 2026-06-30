import type {
  CapabilityManifest,
  Clock,
  ConfigStore,
  IdGenerator,
  MutableCapabilityRegistry,
  ReadonlyContextStore,
} from "../domain";
import { CapabilityImpact } from "../domain";
import type { CadernoService } from "./caderno-service";
import type { CadernoHookBus } from "./hooks";

export interface PluginContext {
  registry: MutableCapabilityRegistry;
  store: ReadonlyContextStore;
  config: ConfigStore;
  clock: Clock;
  ids: IdGenerator;
  service: CadernoService;
  hooks: CadernoHookBus;
}

export interface Plugin {
  manifest: CapabilityManifest;
  setup(context: PluginContext): void;
}

export type ConsentPolicy = (manifest: CapabilityManifest) => boolean;

export const allowUpToMedium: ConsentPolicy = (manifest) =>
  manifest.impact !== CapabilityImpact.HIGH;

export function loadPlugins(
  plugins: readonly Plugin[],
  context: PluginContext,
  consent: ConsentPolicy = allowUpToMedium,
): CapabilityManifest[] {
  const loaded: CapabilityManifest[] = [];
  for (const plugin of plugins) {
    if (!consent(plugin.manifest)) continue;
    plugin.setup(context);
    loaded.push(plugin.manifest);
  }
  return loaded;
}
