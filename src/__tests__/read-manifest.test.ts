import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { describe, it, beforeEach, afterEach, expect } from "vitest";

import * as subject from "../read-manifest.js";
import * as errors from "../errors.js";

describe("readManifest", () => {
  let directory: string;

  beforeEach(async () => {
    directory = await fs.mkdtemp(path.join(os.tmpdir(), "read-manifest-test-"));
  });

  afterEach(async () => {
    await fs.rm(directory, { recursive: true, force: true });
  });

  it("should read a package.json file", async () => {
    await fs.writeFile(
      path.join(directory, "package.json"),
      JSON.stringify({ name: "cool-name", version: "1.2.3" }),
      "utf8"
    );

    const result = await subject.readManifest(
      path.join(directory, "package.json")
    );

    expect(result).toEqual({
      packageSpec: directory,
      manifest: {
        name: "cool-name",
        version: "1.2.3",
        scope: undefined,
        publishConfig: {},
      },
    });
  });

  it("should read a package.json file in a directory", async () => {
    await fs.writeFile(
      path.join(directory, "package.json"),
      JSON.stringify({ name: "cool-name", version: "1.2.3" }),
      "utf8"
    );

    const result = await subject.readManifest(directory);

    expect(result).toMatchObject({
      packageSpec: directory,
      manifest: { name: "cool-name" },
    });
  });

  it("should read a package.json file in the current working directory", async () => {
    const result = await subject.readManifest(undefined);

    expect(result).toMatchObject({
      packageSpec: "",
      manifest: { name: "@jsdevtools/npm-publish" },
    });
  });

  it("should reject invalid packages", async () => {
    await expect(subject.readManifest(42)).rejects.toThrow(
      errors.InvalidPackageError
    );
    await expect(subject.readManifest("./other.json")).rejects.toThrow(
      errors.InvalidPackageError
    );
  });

  it("should read publish config", async () => {
    await fs.writeFile(
      path.join(directory, "package.json"),
      JSON.stringify({
        name: "cool-name",
        version: "1.2.3",
        publishConfig: { access: "public" },
      }),
      "utf8"
    );

    const result = await subject.readManifest(directory);

    expect(result.manifest).toMatchObject({
      publishConfig: { access: "public" },
    });
  });

  it("should read scope", async () => {
    await fs.writeFile(
      path.join(directory, "package.json"),
      JSON.stringify({
        name: "@cool-scope/cool-name",
        version: "1.2.3",
      }),
      "utf8"
    );

    const result = await subject.readManifest(directory);

    expect(result.manifest).toMatchObject({
      scope: "@cool-scope",
    });
  });

  it("should error if package.json cannot be read", async () => {
    const result = subject.readManifest(directory);

    await expect(result).rejects.toThrow(errors.PackageJsonReadError);
  });

  it("should error if package.json file is malformed", async () => {
    await fs.writeFile(
      path.join(directory, "package.json"),
      "NOT JSON",
      "utf8"
    );

    const result = subject.readManifest(directory);

    await expect(result).rejects.toThrow(errors.PackageJsonParseError);
  });

  it("should error if name is invalid", async () => {
    await fs.writeFile(
      path.join(directory, "package.json"),
      JSON.stringify({ name: 42, version: "1.2.3" }),
      "utf8"
    );

    const result = subject.readManifest(directory);

    await expect(result).rejects.toThrow(errors.InvalidPackageNameError);
  });

  it("should error if version is invalid", async () => {
    await fs.writeFile(
      path.join(directory, "package.json"),
      JSON.stringify({ name: "cool-name", version: 42 }),
      "utf8"
    );

    const result = subject.readManifest(directory);

    await expect(result).rejects.toThrow(errors.InvalidPackageVersionError);
  });

  it("should error if publishConfig is invalid", async () => {
    await fs.writeFile(
      path.join(directory, "package.json"),
      JSON.stringify({
        name: "cool-name",
        version: "1.2.3",
        publishConfig: 42,
      }),
      "utf8"
    );

    const result = subject.readManifest(directory);

    await expect(result).rejects.toThrow(
      errors.InvalidPackagePublishConfigError
    );
  });
});
