import { vi, describe, it, expect } from "vitest";
import { when } from "vitest-when";

import * as subject from "../npm-publish.js";
import { readManifest, type PackageManifest } from "../read-manifest.js";
import {
  normalizeOptions,
  type NormalizedOptions,
} from "../normalize-options.js";
import { useNpmEnvironment } from "../npm/index.js";
import {
  compareAndPublish,
  type PublishResult,
} from "../compare-and-publish/index.js";
import type { Logger, Options } from "../options.js";

vi.mock("../read-manifest");
vi.mock("../normalize-options");
vi.mock("../npm");
vi.mock("../compare-and-publish");

describe("npmPublish", () => {
  it("should read the manifest, get publish config, compare, and publish", async () => {
    const options: Options = { package: "./cool-package", token: "abc123" };

    const manifest = { name: "fizzbuzz", version: "1.2.3" } as PackageManifest;

    const normalizedOptions = {
      registry: new URL("http://example.com"),
      tag: { value: "latest" },
      access: { value: "public" },
      dryRun: { value: false },
      strategy: { value: "upgrade" },
      logger: { debug: (message: string) => void message } as Logger,
    } as NormalizedOptions;

    const publishResult: PublishResult = {
      id: "fizzbuzz@1.2.3",
      files: [],
      type: "major",
      oldVersion: "0.1.2",
    };

    when(readManifest).calledWith("./cool-package").thenResolve(manifest);
    when(normalizeOptions)
      .calledWith(manifest, options)
      .thenReturn(normalizedOptions);
    when(useNpmEnvironment<PublishResult>)
      .calledWith(manifest, normalizedOptions, compareAndPublish)
      .thenResolve(publishResult);

    const result = await subject.npmPublish(options);

    expect(result).toEqual({
      id: "fizzbuzz@1.2.3",
      name: "fizzbuzz",
      version: "1.2.3",
      oldVersion: "0.1.2",
      tag: "latest",
      access: "public",
      registry: new URL("http://example.com"),
      type: "major",
      strategy: "upgrade",
      dryRun: false,
    });
  });
});
