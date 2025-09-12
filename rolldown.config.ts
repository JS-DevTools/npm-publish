import { defineConfig } from "rolldown";

export default defineConfig([
  {
    input: "src/action/main.js",
    platform: "node",
    output: {
      dir: "dist",
      format: "esm",
      sourcemap: true,
    },
  },
]);
