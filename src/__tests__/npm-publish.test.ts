import { vi, describe, it, afterEach, expect } from "vitest";
import { imitateEsm, reset } from "testdouble-vitest";
import * as td from "testdouble";

import * as subject from "../npm-publish";
import { readManifest, type Manifest } from "../read-manifest";
import {
  normalizeOptions,
  type AuthConfig,
  type PublishConfig,
} from "../normalize-options";
import {
  getVersions,
  publish,
  type VersionsResult,
  type PublishResult,
} from "../npm";
import { compareVersions, type VersionComparison } from "../compare-versions";
import type { Options } from "../options";

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
    const manifest: Manifest = { name: "cool-package", version: "1.2.3" };
    const authConfig = {
      registryUrl: { value: new URL("http://example.com") },
    } as AuthConfig;
    const publishConfig = {
      tag: { value: "latest" },
      access: { value: "public" },
      dryRun: { value: false },
    } as PublishConfig;
    const versions: VersionsResult = { "dist-tags": {}, versions: [] };
    const comparison: VersionComparison = {
      releaseType: "major",
      previousVersion: "0.1.2",
    };
    const publishResult: PublishResult = { id: "cool-package@1.2.3" };

    td.when(readManifest("./cool-package")).thenResolve(manifest);
    td.when(normalizeOptions(options, manifest)).thenReturn({
      authConfig,
      publishConfig,
    });
    td.when(getVersions("cool-package", authConfig)).thenResolve(versions);
    td.when(compareVersions(versions, publishConfig)).thenReturn(comparison);
    td.when(publish(publishConfig, authConfig)).thenResolve(publishResult);

    const result = await subject.npmPublish(options);

    expect(result).toEqual({
      id: "cool-package@1.2.3",
      name: "cool-package",
      version: "1.2.3",
      previousVersion: "0.1.2",
      tag: "latest",
      access: "public",
      registryUrl: new URL("http://example.com"),
      releaseType: "major",
      dryRun: false,
    });
  });

  it("should skip publish if not needed", async () => {
    const options: Options = { package: "./cool-package", token: "abc123" };
    const manifest: Manifest = { name: "cool-package", version: "1.2.3" };
    const authConfig = {
      registryUrl: { value: new URL("http://example.com") },
    } as AuthConfig;
    const publishConfig = {
      tag: { value: "latest" },
      access: { value: "public" },
      dryRun: { value: false },
    } as PublishConfig;
    const versions: VersionsResult = { "dist-tags": {}, versions: [] };
    const comparison: VersionComparison = {
      releaseType: undefined,
      previousVersion: "0.1.2",
    };

    td.when(readManifest("./cool-package")).thenResolve(manifest);
    td.when(normalizeOptions(options, manifest)).thenReturn({
      authConfig,
      publishConfig,
    });
    td.when(getVersions("cool-package", authConfig)).thenResolve(versions);
    td.when(compareVersions(versions, publishConfig)).thenReturn(comparison);

    const result = await subject.npmPublish(options);

    td.verify(publish(publishConfig, authConfig), { times: 0 });

    expect(result).toEqual({
      id: undefined,
      name: "cool-package",
      version: "1.2.3",
      previousVersion: "0.1.2",
      tag: "latest",
      access: "public",
      registryUrl: new URL("http://example.com"),
      releaseType: undefined,
      dryRun: false,
    });
  });
});
