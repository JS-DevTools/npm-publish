import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type { NormalizedOptions } from "../../normalize-options.js";
import type { PackageManifest } from "../../read-manifest.js";
import * as subject from "../use-npm-environment.js";

describe("useNpmEnvironment", () => {
  let directory: string;

  beforeEach(async () => {
    directory = await fs.mkdtemp(path.join(os.tmpdir(), "read-manifest-test-"));
  });

  afterEach(async () => {
    await fs.rm(directory, { recursive: true, force: true });
  });

  it.each([
    {
      registryUrl: "http://example.com/",
      expectedAuthConfig: "//example.com/:_authToken=${NODE_AUTH_TOKEN}",
      expectedRegistryConfig: "registry=http://example.com/",
    },
    {
      registryUrl: "http://example.com",
      expectedAuthConfig: "//example.com/:_authToken=${NODE_AUTH_TOKEN}",
      expectedRegistryConfig: "registry=http://example.com/",
    },
    {
      registryUrl: "http://example.com/hello/",
      expectedAuthConfig: "//example.com/hello/:_authToken=${NODE_AUTH_TOKEN}",
      expectedRegistryConfig: "registry=http://example.com/hello/",
    },
    {
      registryUrl: "http://example.com/hello",
      expectedAuthConfig: "//example.com/hello/:_authToken=${NODE_AUTH_TOKEN}",
      expectedRegistryConfig: "registry=http://example.com/hello/",
    },
  ])(
    "creates an npmrc file for $registryUrl",
    async ({ registryUrl, expectedAuthConfig, expectedRegistryConfig }) => {
      const inputManifest = { name: "fizzbuzz" } as PackageManifest;
      const inputOptions = {
        token: "abc123",
        registry: new URL(registryUrl),
        temporaryDirectory: directory,
      } as NormalizedOptions;

      let npmrcPath: string | undefined;
      let npmrcContents: string | undefined;

      const result = await subject.useNpmEnvironment(
        inputManifest,
        inputOptions,
        async (manifest, options, environment) => {
          npmrcPath = environment.npm_config_userconfig!;
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
      expect(npmrcContents).toContain(expectedAuthConfig);
      expect(npmrcContents).toContain(expectedRegistryConfig);

      await expect(fs.access(npmrcPath!)).rejects.toThrow(/ENOENT/);
    }
  );

  it("allows unspecified token", async () => {
    const inputManifest = { name: "fizzbuzz" } as PackageManifest;
    const inputOptions = {
      token: undefined,
      registry: new URL("http://example.com/"),
      temporaryDirectory: directory,
    } as NormalizedOptions;

    const result = await subject.useNpmEnvironment(
      inputManifest,
      inputOptions,
      async (_manifest, _options, environment) => {
        await Promise.resolve();
        return environment;
      }
    );

    expect(result).toMatchObject({ NODE_AUTH_TOKEN: "" });
  });
});
