import { describe, expect, it } from "vitest";
import {
  add,
  ceil,
  clamp,
  divide,
  floor,
  multiply,
  round,
  subtract,
  sum,
} from "./math";

describe("math (decimal-backed)", () => {
  it("adds without binary-float drift", () => {
    expect(add(0.1, 0.2)).toBe(0.3);
    expect(0.1 + 0.2).not.toBe(0.3);
  });

  it("sums an array precisely", () => {
    expect(sum([0.1, 0.2, 0.3])).toBe(0.6);
    expect(sum([])).toBe(0);
  });

  it("multiplies, divides and subtracts", () => {
    expect(multiply(1.1, 3)).toBe(3.3);
    expect(divide(149, 200)).toBe(0.745);
    expect(subtract(7, 2.5)).toBe(4.5);
  });

  it("rounds half up", () => {
    expect(round(74.5)).toBe(75);
    expect(round(2.345, 2)).toBe(2.35);
  });

  it("floors, ceils and clamps", () => {
    expect(floor(7.9)).toBe(7);
    expect(ceil(2.1)).toBe(3);
    expect(clamp(1.5, 0, 1)).toBe(1);
    expect(clamp(-0.2, 0, 1)).toBe(0);
  });
});
