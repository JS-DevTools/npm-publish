import { describe, it, expect } from "vitest";

import * as subject from "../get-publish-args";

describe("getPublishArgs", () => {
  it("should add the package spec positional argument", () => {
    const result = subject.getPublishArgs({
      packageSpec: { value: "./cool-package", isDefault: false },
      tag: { value: "next", isDefault: false },
      access: { value: "restricted", isDefault: false },
      dryRun: { value: false, isDefault: false },
      strategy: { value: "upgrade", isDefault: true },
    });

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
});
