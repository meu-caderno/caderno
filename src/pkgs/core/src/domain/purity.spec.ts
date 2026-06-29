import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const dir = dirname(fileURLToPath(import.meta.url));

const FORBIDDEN: Array<[string, RegExp]> = [
  ["zod import", /from ["']zod["']/],
  ["dexie import", /from ["']dexie["']/],
  ["vue import", /from ["']vue["']/],
  ["engine import", /from ["']\.\.\/engine/],
  ["application import", /from ["']\.\.\/application/],
  ["Date.now", /Date\.now/],
  ["Math.random", /Math\.random/],
];

describe("domain purity", () => {
  const files = readdirSync(dir, { recursive: true })
    .filter((f): f is string => typeof f === "string" && f.endsWith(".ts"))
    .filter((f) => !f.endsWith(".spec.ts"));

  for (const file of files) {
    it(`${file} stays free of infra and nondeterminism`, () => {
      const src = readFileSync(join(dir, file), "utf8");
      for (const [label, pattern] of FORBIDDEN) {
        expect(src, `${file} must not contain ${label}`).not.toMatch(pattern);
      }
    });
  }
});
