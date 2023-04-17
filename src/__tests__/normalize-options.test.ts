import { describe, it, expect } from "vitest";

import * as subject from "../normalize-options.js";
import * as errors from "../errors.js";

describe("normalizeOptions", () => {
  const manifest = {
    name: "cool-package",
    version: "1.2.3",
    scope: undefined,
    publishConfig: undefined,
  };

  describe("authConfig", () => {
    it("should set auth config defaults", () => {
      const result = subject.normalizeOptions({ token: "abc123" }, manifest);

      expect(result.authConfig).toEqual({
        token: { value: "abc123", isDefault: false },
        registry: {
          value: new URL("https://registry.npmjs.org/"),
          isDefault: true,
        },
      });
    });

    it("should normalize registry URL", () => {
      const result = subject.normalizeOptions(
        { token: "abc123", registry: "https://registry.npmjs.org/" },
        manifest
      );

      expect(result.authConfig).toMatchObject({
        registry: {
          value: new URL("https://registry.npmjs.org/"),
          isDefault: false,
        },
      });
    });

    it("should normalize custom registry URL", () => {
      const result = subject.normalizeOptions(
        { registry: "https://example.com", token: "abc123" },
        manifest
      );

      expect(result.authConfig).toMatchObject({
        registry: {
          value: new URL("https://example.com"),
          isDefault: false,
        },
      });
    });

    it("should take defaults from `pkg.publishConfig`", () => {
      const result = subject.normalizeOptions(
        { token: "abc123" },
        {
          ...manifest,
          publishConfig: {
            registry: "https://example.com",
          },
        }
      );

      expect(result.authConfig).toMatchObject({
        registry: {
          value: new URL("https://example.com"),
          isDefault: true,
        },
      });
    });

    it("should throw if registry URL invalid", () => {
      expect(() => {
        subject.normalizeOptions(
          { token: "abc123", registry: "hello world" },
          manifest
        );
      }).toThrow(errors.InvalidRegistryUrlError);
    });

    it("should throw if token invalid", () => {
      expect(() => {
        subject.normalizeOptions({ token: "" }, manifest);
      }).toThrow(errors.InvalidTokenError);

      expect(() => {
        // @ts-expect-error: intentionally mistyped for validation testing
        subject.normalizeOptions({ token: 42 }, manifest);
      }).toThrow(errors.InvalidTokenError);
    });
  });

  describe("publishConfig", () => {
    it("should set publish config defaults", () => {
      const result = subject.normalizeOptions({ token: "abc123" }, manifest);

      expect(result.publishConfig).toEqual({
        tag: { value: "latest", isDefault: true },
        access: { value: "public", isDefault: true },
        dryRun: { value: false, isDefault: true },
        strategy: { value: "all", isDefault: true },
      });
    });

    it("should set publish config defaults for scoped package", () => {
      const result = subject.normalizeOptions(
        { token: "abc123" },
        { ...manifest, scope: "@cool-scope" }
      );

      expect(result.publishConfig).toMatchObject({
        access: { value: undefined, isDefault: true },
      });
    });

    it("should allow options to be overridden", () => {
      const result = subject.normalizeOptions(
        {
          token: "abc123",
          package: "./cool-package",
          tag: "next",
          access: "public",
          dryRun: true,
          strategy: "all",
        },
        { ...manifest, scope: "@cool-scope" }
      );

      expect(result.publishConfig).toEqual({
        tag: { value: "next", isDefault: false },
        access: { value: "public", isDefault: false },
        dryRun: { value: true, isDefault: false },
        strategy: { value: "all", isDefault: false },
      });
    });

    it("should take default configs from `pkg.publishConfig`", () => {
      const result = subject.normalizeOptions(
        { token: "abc123" },
        {
          ...manifest,
          scope: "@cool-scope",
          publishConfig: {
            tag: "next",
            access: "public",
          },
        }
      );

      expect(result.publishConfig).toMatchObject({
        tag: { value: "next", isDefault: true },
        access: { value: "public", isDefault: true },
      });
    });

    it("should validate access value", () => {
      expect(() => {
        subject.normalizeOptions(
          {
            token: "abc123",
            // @ts-expect-error: intentionally mistyped for validation testing
            access: "NOT-VALID-ACCESS",
          },
          manifest
        );
      }).toThrow(errors.InvalidAccessError);
    });

    it("should validate strategy value", () => {
      expect(() => {
        subject.normalizeOptions(
          {
            token: "abc123",
            // @ts-expect-error: intentionally mistyped for validation testing
            strategy: "NOT-VALID-STRATEGY",
          },
          manifest
        );
      }).toThrow(errors.InvalidStrategyError);
    });
  });
});
