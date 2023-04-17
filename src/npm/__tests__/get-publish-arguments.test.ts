import { describe, it, expect } from "vitest";

import * as subject from "../get-publish-arguments.js";
import type { NormalizedOptions } from "../../normalize-options.js";

describe("getPublishArguments", () => {
  it("should add explicit arguments", () => {
    const result = subject.getPublishArguments("./cool-package", {
      tag: { value: "next", isDefault: false },
      access: { value: "restricted", isDefault: false },
      dryRun: { value: false, isDefault: false },
      strategy: { value: "upgrade", isDefault: true },
    } as NormalizedOptions);

    expect(result).toEqual([
      "./cool-package",
      "--tag",
      "next",
      "--access",
      "restricted",
      "--dry-run",
      "false",
    ]);
  });

  it("should omit default arguments", () => {
    const result = subject.getPublishArguments("./cool-package", {
      tag: { value: "next", isDefault: true },
      access: { value: "restricted", isDefault: true },
      dryRun: { value: false, isDefault: true },
      strategy: { value: "upgrade", isDefault: true },
    } as NormalizedOptions);

    expect(result).toEqual(["./cool-package"]);
  });

  it("should omit undefined arguments", () => {
    const result = subject.getPublishArguments("./cool-package", {
      tag: { value: "next", isDefault: false },
      access: { value: undefined, isDefault: false },
      dryRun: { value: false, isDefault: false },
      strategy: { value: "upgrade", isDefault: true },
    } as NormalizedOptions);

    expect(result).toEqual([
      "./cool-package",
      "--tag",
      "next",
      "--dry-run",
      "false",
    ]);
  });
});
