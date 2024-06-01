import os from "node:os";
import { describe, it, expect } from "vitest";

import * as subject from "../normalize-options.js";
import * as errors from "../errors.js";
import type { Logger } from "../options.js";

describe("normalizeOptions", () => {
  const manifest = {
    packageSpec: ".",
    name: "cool-package",
    version: "1.2.3",
    scope: undefined,
    publishConfig: undefined,
  };

  describe("authConfig", () => {
    it("should set auth config defaults", () => {
      const result = subject.normalizeOptions(manifest, { token: "abc123" });

      expect(result).toMatchObject({
        token: "abc123",
        registry: new URL("https://registry.npmjs.org/"),
      });
    });

    it("should normalize registry URL", () => {
      const result = subject.normalizeOptions(manifest, {
        token: "abc123",
        registry: "https://example.com",
      });

      expect(result).toMatchObject({
        registry: new URL("https://example.com"),
      });
    });

    it("should take defaults from `pkg.publishConfig`", () => {
      const result = subject.normalizeOptions(
        { ...manifest, publishConfig: { registry: "https://example.com" } },
        { token: "abc123" }
      );

      expect(result).toMatchObject({
        registry: new URL("https://example.com"),
      });
    });

    it("should throw if registry URL invalid", () => {
      expect(() => {
        subject.normalizeOptions(manifest, {
          token: "abc123",
          registry: "hello world",
        });
      }).toThrow(errors.InvalidRegistryUrlError);
    });

    it("should throw if token invalid", () => {
      expect(() => {
        subject.normalizeOptions(manifest, { token: "" });
      }).toThrow(errors.InvalidTokenError);

      expect(() => {
        // @ts-expect-error: intentionally mistyped for validation testing
        subject.normalizeOptions({ token: 42 }, manifest);
      }).toThrow(errors.InvalidTokenError);
    });
  });

  describe("publishConfig", () => {
    it("should set publish config defaults", () => {
      const result = subject.normalizeOptions(manifest, { token: "abc123" });

      expect(result).toMatchObject({
        tag: { value: "latest", isDefault: true },
        access: { value: "public", isDefault: true },
        provenance: { value: false, isDefault: true },
        ignoreScripts: { value: true, isDefault: true },
        dryRun: { value: false, isDefault: true },
        strategy: { value: "all", isDefault: true },
      });
    });

    it("should set publish config defaults for scoped package", () => {
      const result = subject.normalizeOptions(
        { ...manifest, scope: "@cool-scope" },
        { token: "abc123" }
      );

      expect(result).toMatchObject({
        access: { value: undefined, isDefault: true },
      });
    });

    it("should allow options to be overridden", () => {
      const result = subject.normalizeOptions(
        { ...manifest, scope: "@cool-scope" },
        {
          token: "abc123",
          package: "./cool-package",
          tag: "next",
          access: "public",
          provenance: true,
          ignoreScripts: false,
          dryRun: true,
          strategy: "all",
        }
      );

      expect(result).toMatchObject({
        tag: { value: "next", isDefault: false },
        access: { value: "public", isDefault: false },
        provenance: { value: true, isDefault: false },
        ignoreScripts: { value: false, isDefault: false },
        dryRun: { value: true, isDefault: false },
        strategy: { value: "all", isDefault: false },
      });
    });

    it("should take default configs from `pkg.publishConfig`", () => {
      const result = subject.normalizeOptions(
        {
          ...manifest,
          scope: "@cool-scope",
          publishConfig: { tag: "next", access: "public", provenance: true },
        },
        { token: "abc123" }
      );

      expect(result).toMatchObject({
        tag: { value: "next", isDefault: true },
        access: { value: "public", isDefault: true },
        provenance: { value: true, isDefault: true },
      });
    });

    it("should validate tag type", () => {
      expect(() => {
        subject.normalizeOptions(manifest, {
          token: "abc123",
          // @ts-expect-error: intentionally mistyped for validation testing
          tag: 42,
        });
      }).toThrow(errors.InvalidTagError);
    });

    it("should validate tag value", () => {
      expect(() => {
        subject.normalizeOptions(manifest, {
          token: "abc123",
          // tag must not require contain characters encoded by encodeUriComponent
          tag: "fresh&clean",
        });
      }).toThrow(errors.InvalidTagError);
    });

    it("should validate access value", () => {
      expect(() => {
        subject.normalizeOptions(manifest, {
          token: "abc123",
          // @ts-expect-error: intentionally mistyped for validation testing
          access: "NOT-VALID-ACCESS",
        });
      }).toThrow(errors.InvalidAccessError);
    });

    it("should validate strategy value", () => {
      expect(() => {
        subject.normalizeOptions(manifest, {
          token: "abc123",
          // @ts-expect-error: intentionally mistyped for validation testing
          strategy: "NOT-VALID-STRATEGY",
        });
      }).toThrow(errors.InvalidStrategyError);
    });
  });

  describe("runtime config", () => {
    it("should have no logger and set a temporary directory by default", () => {
      const result = subject.normalizeOptions(manifest, { token: "abc123" });

      expect(result).toMatchObject({
        logger: undefined,
        temporaryDirectory: os.tmpdir(),
      });
    });

    it("should pass through the logger and a temporary directory", () => {
      const logger = { debug: (message) => void message } as Logger;
      const temporaryDirectory = "/some/temp/dir";

      const result = subject.normalizeOptions(manifest, {
        token: "abc123",
        logger,
        temporaryDirectory,
      });

      expect(result).toMatchObject({ logger, temporaryDirectory });
    });
  });
});
