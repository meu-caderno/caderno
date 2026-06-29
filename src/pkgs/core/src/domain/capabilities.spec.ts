import { describe, expect, it } from "vitest";
import {
  type CapabilityEngine,
  CapabilityImpact,
  type CapabilityManifest,
  createRegistry,
  type DataSource,
} from "./capabilities";
import { OriginKind } from "./model";

const manifest = (
  id: string,
  impact = CapabilityImpact.LOW,
): CapabilityManifest => ({
  id,
  title: id,
  impact,
  origin: OriginKind.PLUGIN,
});

describe("capability registry", () => {
  it("registers and resolves data sources and engines by id", () => {
    const registry = createRegistry();
    const source: DataSource<number> = {
      manifest: manifest("nums"),
      list: () => [1, 2, 3],
    };
    const engine: CapabilityEngine<number, number> = {
      manifest: manifest("double"),
      run: (n) => n * 2,
    };
    registry.register(source);
    registry.register(engine);

    expect(registry.source<number>("nums")?.list()).toEqual([1, 2, 3]);
    expect(registry.engine<number, number>("double")?.run(2)).toBe(4);
    expect(registry.manifests()).toHaveLength(2);
  });

  it("does not resolve a capability under the wrong kind", () => {
    const registry = createRegistry();
    registry.register({ manifest: manifest("nums"), list: () => [] });
    expect(registry.engine("nums")).toBeUndefined();
    expect(registry.source("missing")).toBeUndefined();
  });
});
