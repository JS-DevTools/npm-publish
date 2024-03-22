import { vi, describe, it, beforeEach, expect } from "vitest";
import { when } from "vitest-when";

import type { PackageManifest } from "../../read-manifest.js";
import type { NormalizedOptions } from "../../normalize-options.js";

import * as subject from "../compare-and-publish.js";
import * as errors from "../../errors.js";
import type { Logger } from "../../options.js";
import { callNpmCli, type NpmCliEnvironment } from "../../npm/index.js";
import { compareVersions } from "../compare-versions.js";
import { getViewArguments, getPublishArguments } from "../get-arguments.js";

vi.mock("../../npm");
vi.mock("../compare-versions");
vi.mock("../get-arguments");

describe("compareAndPublish", () => {
  const logger = { debug: (message: string) => void message } as Logger;
  const environment: NpmCliEnvironment = { foo: "bar" };
  const npmViewResult = { versions: ["0.0.1"], "dist-tags": {} };
  const npmPublishResult = {
    id: "fizzbuzz@1.2.3",
    files: [{ path: "package.json", size: 42 }],
  };

  let manifest: PackageManifest;
  let normalizedOptions: NormalizedOptions;

  beforeEach(() => {
    manifest = {
      packageSpec: ".",
      name: "fizzbuzz",
      version: "1.2.3",
    } as PackageManifest;

    normalizedOptions = {
      token: "abc123",
      ignoreScripts: { value: false },
      dryRun: { value: false },
      logger,
    } as NormalizedOptions;

    when(getViewArguments)
      .calledWith("fizzbuzz", normalizedOptions)
      .thenReturn(["fizzbuzz"]);

    when(getPublishArguments)
      .calledWith(".", normalizedOptions)
      .thenReturn(["."]);

    when(callNpmCli<"view">)
      .calledWith("view", ["fizzbuzz"], {
        logger,
        environment,
        ignoreScripts: false,
      })
      .thenResolve({
        successData: npmViewResult,
        errorCode: undefined,
        error: undefined,
      });

    when(callNpmCli<"publish">)
      .calledWith("publish", ["."], {
        logger,
        environment,
        ignoreScripts: false,
      })
      .thenResolve({
        successData: npmPublishResult,
        errorCode: undefined,
        error: undefined,
      });

    when(compareVersions)
      .calledWith(
        "1.2.3",
        { versions: ["0.0.1"], "dist-tags": {} },
        normalizedOptions
      )
      .thenReturn({ type: "major", oldVersion: "0.0.1" });
  });

  it("should get versions, compare, and publish", async () => {
    const result = await subject.compareAndPublish(
      manifest,
      normalizedOptions,
      environment
    );

    expect(result).toEqual({
      id: "fizzbuzz@1.2.3",
      files: [{ path: "package.json", size: 42 }],
      oldVersion: "0.0.1",
      type: "major",
    });
  });

  it("should get versions, compare, and publish in dry run", async () => {
    normalizedOptions.dryRun.value = true;

    const result = await subject.compareAndPublish(
      manifest,
      normalizedOptions,
      environment
    );

    expect(result).toEqual({
      id: "fizzbuzz@1.2.3",
      files: [{ path: "package.json", size: 42 }],
      oldVersion: "0.0.1",
      type: "major",
    });
  });

  it("should skip publish if version exists", async () => {
    when(compareVersions)
      .calledWith(
        "1.2.3",
        { versions: ["0.0.1"], "dist-tags": {} },
        normalizedOptions
      )
      .thenReturn({ type: undefined, oldVersion: "0.0.1" });

    const result = await subject.compareAndPublish(
      manifest,
      normalizedOptions,
      environment
    );

    expect(result).toEqual({
      id: undefined,
      files: [],
      oldVersion: "0.0.1",
      type: undefined,
    });

    expect(callNpmCli).not.toHaveBeenCalledWith(
      "publish",
      expect.anything(),
      expect.anything()
    );
  });

  it("should run publish if version exists but dry run", async () => {
    normalizedOptions.dryRun.value = true;

    when(compareVersions)
      .calledWith(
        "1.2.3",
        { versions: ["0.0.1"], "dist-tags": {} },
        normalizedOptions
      )
      .thenReturn({ type: undefined, oldVersion: "0.0.1" });

    const result = await subject.compareAndPublish(
      manifest,
      normalizedOptions,
      environment
    );

    expect(result).toEqual({
      id: undefined,
      files: [{ path: "package.json", size: 42 }],
      oldVersion: "0.0.1",
      type: undefined,
    });
  });

  it("should handle an E404 from npm view", async () => {
    when(callNpmCli<"view">)
      .calledWith("view", ["fizzbuzz"], {
        logger,
        environment,
        ignoreScripts: false,
      })
      .thenResolve({
        successData: undefined,
        errorCode: "E404",
        error: new errors.NpmCallError("view", 1, "oh no"),
      });

    when(compareVersions)
      .calledWith("1.2.3", undefined, normalizedOptions)
      .thenReturn({
        type: "major",
        oldVersion: "0.0.1",
      });

    const result = await subject.compareAndPublish(
      manifest,
      normalizedOptions,
      environment
    );

    expect(result).toEqual({
      id: "fizzbuzz@1.2.3",
      files: [{ path: "package.json", size: 42 }],
      oldVersion: "0.0.1",
      type: "major",
    });
  });

  it("should raise a non-E404 from npm view", async () => {
    when(callNpmCli<"view">)
      .calledWith("view", ["fizzbuzz"], {
        logger,
        environment,
        ignoreScripts: false,
      })
      .thenResolve({
        successData: undefined,
        errorCode: "E500",
        error: new errors.NpmCallError("view", 1, "oh no"),
      });

    const result = subject.compareAndPublish(
      manifest,
      normalizedOptions,
      environment
    );

    await expect(result).rejects.toThrow(errors.NpmCallError);
  });

  it("should allow an EPUBLISHCONFLICT from npm publish", async () => {
    when(callNpmCli<"publish">)
      .calledWith("publish", ["."], {
        logger,
        environment,
        ignoreScripts: false,
      })
      .thenResolve({
        successData: undefined,
        errorCode: "EPUBLISHCONFLICT",
        error: new errors.NpmCallError("publish", 1, "oh no"),
      });

    const result = await subject.compareAndPublish(
      manifest,
      normalizedOptions,
      environment
    );

    expect(result).toEqual({
      id: undefined,
      files: [],
      oldVersion: "0.0.1",
      type: undefined,
    });
  });

  it("should raise a non-EPUBLISHCONFLIG from npm publish", async () => {
    when(callNpmCli<"publish">)
      .calledWith("publish", ["."], {
        logger,
        environment,
        ignoreScripts: false,
      })
      .thenResolve({
        successData: undefined,
        errorCode: "E500",
        error: new errors.NpmCallError("publish", 1, "oh no"),
      });

    const result = subject.compareAndPublish(
      manifest,
      normalizedOptions,
      environment
    );

    await expect(result).rejects.toThrow(errors.NpmCallError);
  });

  it("should retry the npm view call is successful but no version data", async () => {
    when(getViewArguments)
      .calledWith("fizzbuzz", normalizedOptions, true)
      .thenReturn(["fizzbuzz@cool-tag"]);

    when(callNpmCli<"view">)
      .calledWith("view", ["fizzbuzz"], {
        logger,
        environment,
        ignoreScripts: false,
      })
      .thenResolve({
        successData: undefined,
        errorCode: undefined,
        error: undefined,
      });

    when(callNpmCli<"view">)
      .calledWith("view", ["fizzbuzz@cool-tag"], {
        logger,
        environment,
        ignoreScripts: false,
      })
      .thenResolve({
        successData: npmViewResult,
        errorCode: undefined,
        error: undefined,
      });

    const result = await subject.compareAndPublish(
      manifest,
      normalizedOptions,
      environment
    );

    expect(result).toEqual({
      id: "fizzbuzz@1.2.3",
      files: [{ path: "package.json", size: 42 }],
      oldVersion: "0.0.1",
      type: "major",
    });
  });

  it("should raise if the retried npm view call fails", async () => {
    when(getViewArguments)
      .calledWith("fizzbuzz", normalizedOptions, true)
      .thenReturn(["fizzbuzz@cool-tag"]);

    when(callNpmCli<"view">)
      .calledWith("view", ["fizzbuzz"], {
        logger,
        environment,
        ignoreScripts: false,
      })
      .thenResolve({
        successData: undefined,
        errorCode: undefined,
        error: undefined,
      });

    when(callNpmCli<"view">)
      .calledWith("view", ["fizzbuzz@cool-tag"], {
        logger,
        environment,
        ignoreScripts: false,
      })
      .thenResolve({
        successData: undefined,
        errorCode: "E500",
        error: new errors.NpmCallError("view", 1, "oh no"),
      });

    const result = subject.compareAndPublish(
      manifest,
      normalizedOptions,
      environment
    );

    await expect(result).rejects.toThrow(errors.NpmCallError);
  });
});
