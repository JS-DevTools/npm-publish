import { describe, it, expect } from "vitest";

import * as subject from "../get-arguments.js";
import type { NormalizedOptions } from "../../normalize-options.js";

describe("get command arguments", () => {
  describe("getViewArguments", () => {
    it("should get dist-tags and versions", () => {
      const result = subject.getViewArguments(
        "cool-package",
        {} as NormalizedOptions
      );

      expect(result).toEqual(["cool-package", "dist-tags", "versions"]);
    });

    it("should include a tag", () => {
      const options = { tag: { value: "cool-tag" } } as NormalizedOptions;
      const result = subject.getViewArguments("cool-package", options, true);

      expect(result).toEqual([
        "cool-package@cool-tag",
        "dist-tags",
        "versions",
      ]);
    });
  });

  describe("getPublishArguments", () => {
    it("should add explicit arguments", () => {
      const result = subject.getPublishArguments("./cool-package", {
        tag: { value: "next", isDefault: false },
        access: { value: "restricted", isDefault: false },
        provenance: { value: true, isDefault: false },
        dryRun: { value: true, isDefault: false },
        strategy: { value: "upgrade", isDefault: true },
      } as NormalizedOptions);

      expect(result).toEqual([
        "./cool-package",
        "--tag",
        "next",
        "--access",
        "restricted",
        "--provenance",
        "--dry-run",
      ]);
    });

    it("should omit default arguments", () => {
      const result = subject.getPublishArguments("./cool-package", {
        tag: { value: "next", isDefault: true },
        access: { value: "restricted", isDefault: true },
        provenance: { value: true, isDefault: true },
        dryRun: { value: true, isDefault: true },
        strategy: { value: "upgrade", isDefault: true },
      } as NormalizedOptions);

      expect(result).toEqual(["./cool-package"]);
    });

    it("should omit undefined string arguments and false boolean arguments", () => {
      const result = subject.getPublishArguments("./cool-package", {
        tag: { value: "next", isDefault: false },
        access: { value: undefined, isDefault: false },
        provenance: { value: false, isDefault: false },
        dryRun: { value: false, isDefault: false },
        strategy: { value: "upgrade", isDefault: true },
      } as NormalizedOptions);

      expect(result).toEqual(["./cool-package", "--tag", "next"]);
    });
  });
});
