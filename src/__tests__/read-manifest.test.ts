import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { describe, it, beforeEach, afterEach, expect } from "vitest";

import * as subject from "../read-manifest";

describe("readManifest", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "read-manifest-test-"));
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("should read a package.json file", async () => {
    await fs.writeFile(
      path.join(tempDir, "package.json"),
      JSON.stringify({ name: "cool-name", version: "cool-version" }),
      "utf8"
    );

    const result = await subject.readManifest(
      path.join(tempDir, "package.json")
    );

    expect(result).toEqual({ name: "cool-name", version: "cool-version" });
  });

  it("should read a package.json file in a directory", async () => {
    await fs.writeFile(
      path.join(tempDir, "package.json"),
      JSON.stringify({ name: "cool-name", version: "cool-version" }),
      "utf8"
    );

    const result = await subject.readManifest(tempDir);

    expect(result).toEqual({ name: "cool-name", version: "cool-version" });
  });

  it("should read a package.json file in the current working directory", async () => {
    const result = await subject.readManifest();

    expect(result).toMatchObject({ name: "@jsdevtools/npm-publish" });
  });
});
