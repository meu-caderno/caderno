import type { OriginKind } from "./model";

export enum CapabilityImpact {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

export interface CapabilityManifest {
  id: string;
  title: string;
  impact: CapabilityImpact;
  origin: OriginKind;
}

export interface DataSource<T> {
  manifest: CapabilityManifest;
  list(): readonly T[];
}

export interface CapabilityEngine<In, Out> {
  manifest: CapabilityManifest;
  run(input: In): Out;
}

export type Capability =
  | DataSource<unknown>
  | CapabilityEngine<unknown, unknown>;

export interface CapabilityRegistry {
  manifests(): readonly CapabilityManifest[];
  source<T>(id: string): DataSource<T> | undefined;
  engine<In, Out>(id: string): CapabilityEngine<In, Out> | undefined;
}

export interface MutableCapabilityRegistry extends CapabilityRegistry {
  register(capability: Capability): void;
}

function isDataSource(
  capability: Capability,
): capability is DataSource<unknown> {
  return "list" in capability;
}

function isEngine(
  capability: Capability,
): capability is CapabilityEngine<unknown, unknown> {
  return "run" in capability;
}

export function createRegistry(): MutableCapabilityRegistry {
  const capabilities = new Map<string, Capability>();
  return {
    register(capability) {
      capabilities.set(capability.manifest.id, capability);
    },
    manifests() {
      return [...capabilities.values()].map((c) => c.manifest);
    },
    source<T>(id: string) {
      const found = capabilities.get(id);
      return found && isDataSource(found)
        ? (found as DataSource<T>)
        : undefined;
    },
    engine<In, Out>(id: string) {
      const found = capabilities.get(id);
      return found && isEngine(found)
        ? (found as CapabilityEngine<In, Out>)
        : undefined;
    },
  };
}

export function emptyRegistry(): CapabilityRegistry {
  return createRegistry();
}
