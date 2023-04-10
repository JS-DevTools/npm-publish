import { vi, describe, it, beforeEach, afterEach, expect } from "vitest";
import { imitateEsm, reset } from "testdouble-vitest";
import * as td from "testdouble";

import { createNpmClient, type NpmClient } from "..";
import { configureNpmCli, removeNpmCliConfig } from "../configure-npm";
import { callNpmCli } from "../call-npm-cli";

vi.mock("../configure-npm", () => imitateEsm("../configure-npm"));
vi.mock("../call-npm-cli", () => imitateEsm("../call-npm-cli"));

describe("npm", () => {
  const options = { registry: "https://example.com", token: "abc123" };
  const cliOptions = { extraArgs: [], env: {} };
  let subject: NpmClient;

  beforeEach(async () => {
    td.when(configureNpmCli(options), { times: 1 }).thenResolve(cliOptions);
    subject = await createNpmClient(options);
  });

  afterEach(() => {
    reset();
  });

  it("should clean up a client", async () => {
    await subject.cleanup();
    td.verify(removeNpmCliConfig(cliOptions), { times: 1 });
  });

  it("should get existing versions", async () => {
    td.when(
      callNpmCli(
        "view",
        ["@example/cool-package", "dist-tags", "versions"],
        cliOptions
      )
    ).thenResolve({
      "dist-tags": { latest: "1.2.3" },
      versions: ["1.2.3", "4.5.6"],
    });

    const result = await subject.getVersions("@example/cool-package");

    expect(result).toEqual({
      "dist-tags": { latest: "1.2.3" },
      versions: ["1.2.3", "4.5.6"],
    });
  });

  it("should get no versions if unpublished", async () => {
    td.when(
      callNpmCli(
        "view",
        ["@example/cool-package", "dist-tags", "versions"],
        cliOptions
      )
    ).thenResolve({
      code: "E404",
      error: new Error("oh no"),
    });

    const result = await subject.getVersions("@example/cool-package");

    expect(result).toEqual({
      "dist-tags": {},
      versions: [],
    });
  });

  it("should raise if other error", async () => {
    td.when(
      callNpmCli(
        "view",
        ["@example/cool-package", "dist-tags", "versions"],
        cliOptions
      )
    ).thenResolve({
      code: "E999",
      error: new Error("oh no"),
    });

    const result = subject.getVersions("@example/cool-package");

    await expect(result).rejects.toThrow(/oh no/);
  });
});
