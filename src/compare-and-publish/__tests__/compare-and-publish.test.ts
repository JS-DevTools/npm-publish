import { vi, describe, it, beforeEach, afterEach, expect } from "vitest";
import { imitateEsm, reset } from "testdouble-vitest";
import * as td from "testdouble";

import type { PackageManifest } from "../../read-manifest.js";
import type { NormalizedOptions } from "../../normalize-options.js";

import * as subject from "../compare-and-publish.js";
import * as errors from "../../errors.js";
import type { Logger } from "../../options.js";
import { callNpmCli } from "../../npm/index.js";
import { compareVersions } from "../compare-versions.js";
import { getViewArguments, getPublishArguments } from "../get-arguments.js";

vi.mock("../../npm", () => imitateEsm("../../npm"));
vi.mock("../compare-versions", () => imitateEsm("../compare-versions"));
vi.mock("../get-arguments", () => imitateEsm("../get-arguments"));

describe("compareAndPublish", () => {
  const manifest = {
    packageSpec: ".",
    name: "fizzbuzz",
    version: "1.2.3",
  } as PackageManifest;

  const logger = { debug: (message: string) => void message } as Logger;
  const normalizedOptions = {
    token: "abc123",
    ignoreScripts: { value: false },
    logger,
  } as NormalizedOptions;
  const environment = { foo: "bar" };
  const npmViewResult = { versions: ["0.0.1"], "dist-tags": {} };
  const npmPublishResult = { id: "fizzbuzz@1.2.3", files: [] };

  beforeEach(() => {
    td.when(getViewArguments("fizzbuzz", normalizedOptions)).thenReturn([
      "fizzbuzz",
    ]);
    td.when(getPublishArguments(".", normalizedOptions)).thenReturn(["."]);

    td.when(
      callNpmCli("view", ["fizzbuzz"], {
        logger,
        environment,
        ignoreScripts: false,
      })
    ).thenResolve({
      successData: npmViewResult,
      errorCode: undefined,
      error: undefined,
    });

    td.when(
      callNpmCli("publish", ["."], {
        logger,
        environment,
        ignoreScripts: false,
      })
    ).thenResolve({
      successData: npmPublishResult,
      errorCode: undefined,
      error: undefined,
    });

    td.when(
      compareVersions(
        "1.2.3",
        { versions: ["0.0.1"], "dist-tags": {} },
        normalizedOptions
      )
    ).thenReturn({ type: "major", oldVersion: "0.0.1" });
  });

  afterEach(() => {
    reset();
  });

  it("should get versions, compare, and publish", async () => {
    const result = await subject.compareAndPublish(
      manifest,
      normalizedOptions,
      environment
    );

    expect(result).toEqual({
      id: "fizzbuzz@1.2.3",
      files: [],
      oldVersion: "0.0.1",
      type: "major",
    });
  });

  it("should skip publish if version exists", async () => {
    td.when(
      compareVersions(
        "1.2.3",
        { versions: ["0.0.1"], "dist-tags": {} },
        normalizedOptions
      )
    ).thenReturn({ type: undefined, oldVersion: "0.0.1" });

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

    td.verify(
      callNpmCli("publish", td.matchers.anything(), td.matchers.anything()),
      { times: 0 }
    );
  });

  it("should handle an E404 from npm view", async () => {
    td.when(
      callNpmCli("view", ["fizzbuzz"], {
        logger,
        environment,
        ignoreScripts: false,
      })
    ).thenResolve({
      successData: undefined,
      errorCode: "E404",
      error: new errors.NpmCallError("view", 1, "oh no"),
    });

    td.when(compareVersions("1.2.3", undefined, normalizedOptions)).thenReturn({
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
      files: [],
      oldVersion: "0.0.1",
      type: "major",
    });
  });

  it("should raise a non-E404 from npm view", async () => {
    td.when(
      callNpmCli("view", ["fizzbuzz"], {
        logger,
        environment,
        ignoreScripts: false,
      })
    ).thenResolve({
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
    td.when(
      callNpmCli("publish", ["."], {
        logger,
        environment,
        ignoreScripts: false,
      })
    ).thenResolve({
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
    td.when(
      callNpmCli("publish", ["."], {
        logger,
        environment,
        ignoreScripts: false,
      })
    ).thenResolve({
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
    td.when(getViewArguments("fizzbuzz", normalizedOptions, true)).thenReturn([
      "fizzbuzz@cool-tag",
    ]);

    td.when(
      callNpmCli("view", ["fizzbuzz"], {
        logger,
        environment,
        ignoreScripts: false,
      })
    ).thenResolve({
      successData: undefined,
      errorCode: undefined,
      error: undefined,
    });

    td.when(
      callNpmCli("view", ["fizzbuzz@cool-tag"], {
        logger,
        environment,
        ignoreScripts: false,
      })
    ).thenResolve({
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
      files: [],
      oldVersion: "0.0.1",
      type: "major",
    });
  });

  it("should raise if the retried npm view call fails", async () => {
    td.when(getViewArguments("fizzbuzz", normalizedOptions, true)).thenReturn([
      "fizzbuzz@cool-tag",
    ]);

    td.when(
      callNpmCli("view", ["fizzbuzz"], {
        logger,
        environment,
        ignoreScripts: false,
      })
    ).thenResolve({
      successData: undefined,
      errorCode: undefined,
      error: undefined,
    });

    td.when(
      callNpmCli("view", ["fizzbuzz@cool-tag"], {
        logger,
        environment,
        ignoreScripts: false,
      })
    ).thenResolve({
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
