import { describe, it, expect } from "vitest";

import * as subject from "../normalize-options";
import * as errors from "../errors";

describe("normalizeOptions", () => {
  const manifest = { name: "cool-package", version: "1.2.3" };
  const scopedManifest = {
    name: "@cool-org/cool-package",
    version: "1.2.3",
    scope: "@cool-org",
  };

  describe("authConfig", () => {
    it("should set auth config defaults", () => {
      const result = subject.normalizeOptions({ token: "abc123" }, manifest);

      expect(result.authConfig).toEqual({
        token: { value: "abc123", isDefault: false },
        registryUrl: {
          value: new URL("https://registry.npmjs.org/"),
          isDefault: true,
        },
      });
    });

    it("should normalize registry URL", () => {
      const result = subject.normalizeOptions(
        { token: "abc123", registryUrl: "https://registry.npmjs.org/" },
        manifest
      );

      expect(result.authConfig).toEqual({
        token: { value: "abc123", isDefault: false },
        registryUrl: {
          value: new URL("https://registry.npmjs.org/"),
          isDefault: true,
        },
      });
    });

    it("should normalize custom registry URL", () => {
      const result = subject.normalizeOptions(
        { registryUrl: "https://example.com", token: "abc123" },
        manifest
      );

      expect(result.authConfig).toEqual({
        registryUrl: {
          value: new URL("https://example.com"),
          isDefault: false,
        },
        token: { value: "abc123", isDefault: false },
      });
    });

    it("should throw if registry URL invalid", () => {
      expect(() => {
        subject.normalizeOptions(
          { token: "abc123", registryUrl: "hello world" },
          manifest
        );
      }).toThrow(errors.InvalidRegistryUrlError);
    });

    it("should throw if token invalid", () => {
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
        packageSpec: { value: "", isDefault: true },
        tag: { value: "latest", isDefault: true },
        access: { value: "public", isDefault: true },
        dryRun: { value: false, isDefault: true },
        strategy: { value: "upgrade", isDefault: true },
      });
    });

    it("should set publish config defaults for scoped package", () => {
      const result = subject.normalizeOptions(
        { token: "abc123" },
        scopedManifest
      );

      expect(result.publishConfig).toEqual({
        packageSpec: { value: "", isDefault: true },
        tag: { value: "latest", isDefault: true },
        access: { value: "restricted", isDefault: true },
        dryRun: { value: false, isDefault: true },
        strategy: { value: "upgrade", isDefault: true },
      });
    });
  });
});
