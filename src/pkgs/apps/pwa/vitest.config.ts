import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: "happy-dom",
    globals: true,
    include: ["app/**/*.spec.ts"],
    passWithNoTests: true,
    coverage: {
      provider: "v8",
      reportsDirectory: "./coverage",
      include: ["app/**/*.{ts,vue}"],
      exclude: ["app/**/*.spec.ts", "**/.nuxt/**"],
      reporter: ["text", "html", "lcov"],
    },
  },
});
