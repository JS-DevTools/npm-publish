import { vi, describe, it, afterEach, expect } from "vitest";
import { imitateEsm, reset } from "testdouble-vitest";
import * as td from "testdouble";

import * as subject from "../npm-publish.js";
import { readManifest, type PackageManifest } from "../read-manifest.js";
import {
  normalizeOptions,
  type NormalizedOptions,
} from "../normalize-options.js";
import {
  getVersions,
  publish,
  type PublishedVersions,
  type PublishResult,
} from "../npm/index.js";
import {
  compareVersions,
  type VersionComparison,
} from "../compare-versions.js";
import type { Options } from "../options.js";

vi.mock("../read-manifest", () => imitateEsm("../read-manifest"));
vi.mock("../normalize-options", () => imitateEsm("../normalize-options"));
vi.mock("../npm", () => imitateEsm("../npm"));
vi.mock("../compare-versions", () => imitateEsm("../compare-versions"));

describe("npmPublish", () => {
  afterEach(() => {
    reset();
  });

  it("should read the manifest, get publish config, compare, and publish", async () => {
    const options: Options = { package: "./cool-package", token: "abc123" };
    const packageSpec = ".";
    const manifest = {
      name: "cool-package",
      version: "1.2.3",
    } as PackageManifest;
    const normalizedOptions = {
      registry: new URL("http://example.com"),
      tag: { value: "latest" },
      access: { value: "public" },
      dryRun: { value: false },
      strategy: { value: "upgrade" },
    } as NormalizedOptions;
    const versions: PublishedVersions = { "dist-tags": {}, versions: [] };
    const comparison: VersionComparison = {
      type: "major",
      oldVersion: "0.1.2",
    };
    const publishResult: PublishResult = {
      id: "cool-package@1.2.3",
      files: [],
    };

    td.when(readManifest("./cool-package")).thenResolve({
      packageSpec,
      manifest,
    });
    td.when(normalizeOptions(options, manifest)).thenReturn(normalizedOptions);
    td.when(getVersions("cool-package", normalizedOptions)).thenResolve(
      versions
    );
    td.when(compareVersions("1.2.3", versions, normalizedOptions)).thenReturn(
      comparison
    );
    td.when(publish(packageSpec, normalizedOptions)).thenResolve(publishResult);

    const result = await subject.npmPublish(options);

    expect(result).toEqual({
      id: "cool-package@1.2.3",
      name: "cool-package",
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

  it("should skip publish if not needed", async () => {
    const options: Options = { package: "./cool-package", token: "abc123" };
    const packageSpec = ".";
    const manifest = {
      name: "cool-package",
      version: "1.2.3",
    } as PackageManifest;
    const normalizedOptions = {
      registry: new URL("http://example.com"),
      tag: { value: "latest" },
      access: { value: "public" },
      dryRun: { value: false },
      strategy: { value: "upgrade" },
    } as NormalizedOptions;
    const versions: PublishedVersions = { "dist-tags": {}, versions: [] };
    const comparison: VersionComparison = {
      type: undefined,
      oldVersion: "0.1.2",
    };

    td.when(readManifest("./cool-package")).thenResolve({
      packageSpec,
      manifest,
    });
    td.when(normalizeOptions(options, manifest)).thenReturn(normalizedOptions);
    td.when(getVersions("cool-package", normalizedOptions)).thenResolve(
      versions
    );
    td.when(compareVersions("1.2.3", versions, normalizedOptions)).thenReturn(
      comparison
    );

    const result = await subject.npmPublish(options);

    td.verify(publish(packageSpec, normalizedOptions), {
      times: 0,
    });

    expect(result).toEqual({
      id: undefined,
      name: "cool-package",
      version: "1.2.3",
      oldVersion: "0.1.2",
      tag: "latest",
      access: "public",
      registry: new URL("http://example.com"),
      type: undefined,
      strategy: "upgrade",
      dryRun: false,
    });
  });
});
