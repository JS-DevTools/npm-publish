import { describe, it, expect } from "vitest";

import * as subject from "../compare-versions.js";
import type { NormalizedOptions } from "../../normalize-options.js";

describe("compareVersions", () => {
  it("should recognize initial release on a tag", () => {
    const result = subject.compareVersions(
      "0.0.0",
      { versions: [], "dist-tags": {} },
      { tag: { value: "next" } } as NormalizedOptions
    );

    expect(result).toEqual({
      type: "initial",
      oldVersion: undefined,
    });
  });

  it("should handle no known versions or dist tags", () => {
    const result = subject.compareVersions("0.0.0", undefined, {
      tag: { value: "next" },
    } as NormalizedOptions);

    expect(result).toEqual({
      type: "initial",
      oldVersion: undefined,
    });
  });

  it("should recognize an unpublished release", () => {
    const result = subject.compareVersions(
      "0.0.0",
      { versions: ["1.2.3", "4.5.6"], "dist-tags": { next: "1.2.3" } },
      {
        strategy: { value: "all" },
        tag: { value: "next" },
      } as NormalizedOptions
    );

    expect(result).toEqual({
      type: "different",
      oldVersion: "1.2.3",
    });
  });

  it("should recognize an upgrade release", () => {
    const result = subject.compareVersions(
      "1.4.3",
      { versions: ["1.2.3", "4.5.6"], "dist-tags": { next: "1.2.3" } },
      {
        strategy: { value: "upgrade" },
        tag: { value: "next" },
      } as NormalizedOptions
    );

    expect(result).toEqual({
      type: "minor",
      oldVersion: "1.2.3",
    });
  });

  it("should not release if version already exists", () => {
    const result = subject.compareVersions(
      "4.5.6",
      { versions: ["1.2.3", "4.5.6"], "dist-tags": { next: "4.5.6" } },
      {
        strategy: { value: "all" },
        tag: { value: "next" },
      } as NormalizedOptions
    );

    expect(result).toEqual({
      type: undefined,
      oldVersion: "4.5.6",
    });
  });

  it("should not upgrade if version already exists", () => {
    const result = subject.compareVersions(
      "4.5.6",
      { versions: ["1.2.3", "4.5.6"], "dist-tags": { next: "1.2.3" } },
      {
        strategy: { value: "upgrade" },
        tag: { value: "next" },
      } as NormalizedOptions
    );

    expect(result).toEqual({
      type: undefined,
      oldVersion: "1.2.3",
    });
  });

  it("should not upgrade if not an upgrade", () => {
    const result = subject.compareVersions(
      "1.2.2",
      { versions: ["1.2.3", "4.5.6"], "dist-tags": { next: "1.2.3" } },
      {
        strategy: { value: "upgrade" },
        tag: { value: "next" },
      } as NormalizedOptions
    );

    expect(result).toEqual({
      type: undefined,
      oldVersion: "1.2.3",
    });
  });
});
