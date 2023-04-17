import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/__tests__/**/*.test.ts"],
    coverage: {
      provider: "istanbul",
      all: true,
      include: ["src"],
      reporter: ["text", "lcov"],
    },
  },
});
