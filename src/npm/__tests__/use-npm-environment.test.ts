import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { describe, beforeEach, afterEach, it, expect } from "vitest";

import type { PackageManifest } from "../../read-manifest.js";
import type { NormalizedOptions } from "../../normalize-options.js";
import * as subject from "../use-npm-environment.js";

describe("useNpmEnvironment", () => {
  let directory: string;

  beforeEach(async () => {
    directory = await fs.mkdtemp(path.join(os.tmpdir(), "read-manifest-test-"));
  });

  afterEach(async () => {
    await fs.rm(directory, { recursive: true, force: true });
  });

  it("create an npmrc file ", async () => {
    const inputManifest = { name: "fizzbuzz" } as PackageManifest;
    const inputOptions = {
      token: "abc123",
      registry: new URL("http://example.com/cool-registry/"),
      temporaryDirectory: directory,
    } as NormalizedOptions;

    let npmrcPath: string | undefined;
    let npmrcContents: string | undefined;

    const result = await subject.useNpmEnvironment(
      inputManifest,
      inputOptions,
      async (manifest, options, environment) => {
        npmrcPath = environment["npm_config_userconfig"]!;
        npmrcContents = await fs.readFile(npmrcPath, "utf8");
        return { manifest, options, environment };
      }
    );

    expect(result).toEqual({
      manifest: inputManifest,
      options: inputOptions,
      environment: {
        NODE_AUTH_TOKEN: "abc123",
        npm_config_userconfig: npmrcPath,
      },
    });
    expect(npmrcContents).toContain(
      "//example.com/:_authToken=${NODE_AUTH_TOKEN}"
    );
    expect(npmrcContents).toContain(
      "registry=http://example.com/cool-registry/"
    );
    await expect(fs.access(npmrcPath!)).rejects.toThrow(/ENOENT/);
  });
});
