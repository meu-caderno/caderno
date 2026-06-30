import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.spec.ts"],
    passWithNoTests: true,
    coverage: {
      provider: "v8",
      reportsDirectory: "./coverage",
      include: ["src/**/*.ts"],
      exclude: ["src/**/index.ts", "src/**/*.spec.ts"],
      reporter: ["text", "html", "lcov"],
    },
  },
});
