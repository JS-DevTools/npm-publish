import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/__tests__/**/*.test.ts"],
    mockReset: true,
    unstubEnvs: true,
    unstubGlobals: true,
    coverage: {
      provider: "istanbul",
      all: true,
      include: ["src"],
      reporter: ["text", "lcov"],
    },
  },
});
