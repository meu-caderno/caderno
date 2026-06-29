import { describe, expect, it } from "vitest";
import type { DayIso, Timestamp } from "../domain";
import { CapabilityImpact, createRegistry, OriginKind } from "../domain";
import {
  counterIds,
  createInMemoryConfigStore,
  createInMemoryContextStore,
  fixedClock,
} from "../testing";
import { createCadernoService } from "./caderno-service";
import { createCadernoHooks } from "./hooks";
import { loadPlugins, type Plugin, type PluginContext } from "./plugins";

function makeContext(): PluginContext {
  const store = createInMemoryContextStore();
  const clock = fixedClock(1 as Timestamp, "2026-01-01" as DayIso);
  const ids = counterIds();
  const hooks = createCadernoHooks();
  return {
    registry: createRegistry(),
    store,
    config: createInMemoryConfigStore(),
    clock,
    ids,
    hooks,
    service: createCadernoService({ store, clock, ids, hooks }),
  };
}

const numbersPlugin: Plugin = {
  manifest: {
    id: "numbers",
    title: "Numbers",
    impact: CapabilityImpact.LOW,
    origin: OriginKind.PLUGIN,
  },
  setup(context) {
    context.registry.register({
      manifest: this.manifest,
      list: () => [1, 2, 3],
    });
  },
};

const riskyPlugin: Plugin = {
  manifest: {
    id: "risky",
    title: "Risky",
    impact: CapabilityImpact.HIGH,
    origin: OriginKind.PLUGIN,
  },
  setup(context) {
    context.registry.register({ manifest: this.manifest, list: () => [] });
  },
};

describe("loadPlugins", () => {
  it("runs setup and registers the plugin's capabilities", () => {
    const context = makeContext();
    const loaded = loadPlugins([numbersPlugin], context);
    expect(loaded).toHaveLength(1);
    expect(context.registry.source<number>("numbers")?.list()).toEqual([
      1, 2, 3,
    ]);
  });

  it("blocks HIGH-impact plugins by default (consent required)", () => {
    const context = makeContext();
    expect(loadPlugins([riskyPlugin], context)).toHaveLength(0);
    expect(context.registry.source("risky")).toBeUndefined();
  });

  it("loads HIGH-impact plugins when consent allows it", () => {
    const context = makeContext();
    const loaded = loadPlugins([riskyPlugin], context, () => true);
    expect(loaded).toHaveLength(1);
    expect(context.registry.source("risky")).toBeDefined();
  });
});
