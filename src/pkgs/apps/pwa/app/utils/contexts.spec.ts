import type { Id } from "@meu-caderno/core";
import { describe, expect, it } from "vitest";
import { pickEffectiveContextId } from "./contexts";

const id = (value: string) => value as Id;

describe("pickEffectiveContextId", () => {
  it("keeps the active id when it is still available", () => {
    const available = [id("a"), id("b"), id("c")];
    expect(pickEffectiveContextId(available, id("b"))).toBe(id("b"));
  });

  it("falls back to the first available when the active id disappeared", () => {
    const available = [id("a"), id("b")];
    expect(pickEffectiveContextId(available, id("gone"))).toBe(id("a"));
  });

  it("falls back to the first available when there is no active id", () => {
    expect(pickEffectiveContextId([id("a"), id("b")], null)).toBe(id("a"));
  });

  it("returns null when nothing is available", () => {
    expect(pickEffectiveContextId([], id("a"))).toBeNull();
    expect(pickEffectiveContextId([], null)).toBeNull();
  });
});
