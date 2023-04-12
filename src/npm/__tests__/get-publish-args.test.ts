import { describe, it, expect } from "vitest";

import * as subject from "../get-publish-args";

describe("getPublishArgs", () => {
  it("should return no args if no config", () => {
    const result = subject.getPublishArgs({});

    expect(result).toEqual([]);
  });

  it("should add the package spec positional argument", () => {
    const result = subject.getPublishArgs({ packageSpec: "./cool-package" });

    expect(result).toEqual(["./cool-package"]);
  });

  it("should add a tag flag", () => {
    const result = subject.getPublishArgs({
      packageSpec: "./cool-package",
      tag: "next",
    });

    expect(result).toEqual(["./cool-package", "--tag", "next"]);
  });

  it("should add a access flag", () => {
    const result = subject.getPublishArgs({
      packageSpec: "./cool-package",
      access: "restricted",
    });

    expect(result).toEqual(["./cool-package", "--access", "restricted"]);
  });

  it("should add a dry run flag", () => {
    const result = subject.getPublishArgs({
      packageSpec: "./cool-package",
      dryRun: false,
    });

    expect(result).toEqual(["./cool-package", "--dry-run", "false"]);
  });
});
