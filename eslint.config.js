import baseConfig from "@mcous/eslint-config";
import { defineConfig, globalIgnores } from "eslint/config";
import jsdoc from "eslint-plugin-jsdoc";
import globals from "globals";

export default defineConfig(
  baseConfig,
  {
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        projectService: {
          allowDefaultProject: [
            "eslint.config.js",
            "prettier.config.js",
            "vitest.config.ts",
            "action.js",
            "bin/npm-publish.js",
          ],
        },
      },
    },
  },
  {
    files: ["**/*.ts"],
    extends: [jsdoc.configs["flat/recommended-typescript-error"]],
  },
  {
    files: ["**/*.js"],
    extends: [jsdoc.configs["flat/recommended-typescript-flavor-error"]],
  },
  {
    files: ["**/__tests__/**"],
    rules: {
      "@typescript-eslint/no-unsafe-assignment": "off",
    },
  },
  {
    rules: {
      "jsdoc/tag-lines": "off",
    },
  },
  globalIgnores(["dist/**", "lib/**", "coverage/**"])
);
