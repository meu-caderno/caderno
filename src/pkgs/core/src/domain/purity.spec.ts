import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const directory = dirname(fileURLToPath(import.meta.url));

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
  const files = readdirSync(directory, { recursive: true })
    .filter(
      (file): file is string =>
        typeof file === "string" && file.endsWith(".ts"),
    )
    .filter((file) => !file.endsWith(".spec.ts"));

  for (const file of files) {
    it(`${file} stays free of infra and nondeterminism`, () => {
      const source = readFileSync(join(directory, file), "utf8");
      for (const [label, pattern] of FORBIDDEN) {
        expect(source, `${file} must not contain ${label}`).not.toMatch(
          pattern,
        );
      }
    });
  }
});
