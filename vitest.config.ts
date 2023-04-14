import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "istanbul",
      all: true,
      include: ["src"],
      reporter: ["text", "lcov"],
    },
  },
});
