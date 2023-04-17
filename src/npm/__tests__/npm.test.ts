import { vi, describe, it, beforeEach, afterEach, expect } from "vitest";
import { imitateEsm, reset } from "testdouble-vitest";
import * as td from "testdouble";

import type { AuthConfig, PublishConfig } from "../../normalize-options.js";

import * as subject from "../index.js";
import { useNpmEnvironment, type NpmCliTask } from "../use-npm-environment.js";
import { callNpmCli } from "../call-npm-cli.js";
import { getPublishArguments } from "../get-publish-arguments.js";

vi.mock("../use-npm-environment", () => imitateEsm("../use-npm-environment"));
vi.mock("../call-npm-cli", () => imitateEsm("../call-npm-cli"));
vi.mock("../get-publish-arguments", () =>
  imitateEsm("../get-publish-arguments")
);

describe("npm", () => {
  const authConfig = { token: { value: "abc123" } } as AuthConfig;
  const environment = { foo: "bar" };

  beforeEach(() => {
    td.when(useNpmEnvironment(authConfig, td.matchers.isA(Function))).thenDo(
      (_: unknown, task: NpmCliTask<unknown>) => task(environment)
    );
  });

  afterEach(() => {
    reset();
  });

  it("should get existing versions", async () => {
    td.when(
      callNpmCli<subject.PublishedVersions>(
        "view",
        ["@example/cool-package", "dist-tags", "versions"],
        { environment, ifError: { e404: { "dist-tags": {}, versions: [] } } }
      )
    ).thenResolve({
      "dist-tags": { latest: "1.2.3" },
      versions: ["1.2.3", "4.5.6"],
    });

    const result = await subject.getVersions(
      "@example/cool-package",
      authConfig
    );

    expect(result).toEqual({
      "dist-tags": { latest: "1.2.3" },
      versions: ["1.2.3", "4.5.6"],
    });
  });

  it("should publish a package", async () => {
    const publishConfig = { tag: { value: "next" } } as PublishConfig;

    td.when(getPublishArguments("./package", publishConfig)).thenReturn([
      "--tag",
      "next",
    ]);
    td.when(
      callNpmCli<subject.PublishResult>("publish", ["--tag", "next"], {
        environment,
      })
    ).thenResolve({ id: "@example/cool-package@1.2.3" });

    const result = await subject.publish(
      "./package",
      publishConfig,
      authConfig
    );

    expect(result).toEqual({ id: "@example/cool-package@1.2.3" });
  });
});
