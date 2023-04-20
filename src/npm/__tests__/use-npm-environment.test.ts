import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { describe, beforeEach, afterEach, it, expect } from "vitest";

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
    let result: subject.NpmCliEnvironment | undefined;
    let npmrcPath: string | undefined;
    let npmrcContents: string | undefined;

    await subject.useNpmEnvironment(
      {
        token: "abc123",
        registry: new URL("http://example.com/cool-registry/"),
        temporaryDirectory: directory,
      } as NormalizedOptions,
      async (environment) => {
        result = environment;
        npmrcPath = result["npm_config_userconfig"]!;
        npmrcContents = await fs.readFile(npmrcPath, "utf8");
      }
    );

    expect(result).toEqual({
      NODE_AUTH_TOKEN: "abc123",
      npm_config_userconfig: npmrcPath,
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
