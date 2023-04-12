import { vi, describe, it, beforeEach, afterEach, expect } from "vitest";
import { imitateEsm, reset } from "testdouble-vitest";
import * as td from "testdouble";

import type { AuthConfig, PublishConfig } from "../../normalize-options";

import * as subject from "..";
import { useNpmEnv, type NpmCliTask } from "../use-npm-env";
import { callNpmCli } from "../call-npm-cli";
import { getPublishArgs } from "../get-publish-args";

vi.mock("../use-npm-env", () => imitateEsm("../use-npm-env"));
vi.mock("../call-npm-cli", () => imitateEsm("../call-npm-cli"));
vi.mock("../get-publish-args", () => imitateEsm("../get-publish-args"));

describe("npm", () => {
  const authConfig = { token: { value: "abc123" } } as AuthConfig;
  const cliEnv = { foo: "bar" };

  beforeEach(() => {
    td.when(useNpmEnv(authConfig, td.matchers.isA(Function))).thenDo(
      (_: unknown, task: NpmCliTask<unknown>) => task(cliEnv)
    );
  });

  afterEach(() => {
    reset();
  });

  it("should get existing versions", async () => {
    td.when(
      callNpmCli<subject.VersionsResult>(
        "view",
        ["@example/cool-package", "dist-tags", "versions"],
        { env: cliEnv, ifError: { e404: { "dist-tags": {}, versions: [] } } }
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

    td.when(getPublishArgs(publishConfig)).thenReturn(["--tag", "next"]);
    td.when(
      callNpmCli<subject.PublishResult>("publish", ["--tag", "next"], {
        env: cliEnv,
      })
    ).thenResolve({ id: "@example/cool-package@1.2.3" });

    const result = await subject.publish(publishConfig, authConfig);

    expect(result).toEqual({ id: "@example/cool-package@1.2.3" });
  });
});
