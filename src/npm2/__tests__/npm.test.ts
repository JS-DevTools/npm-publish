import { vi, describe, it, afterEach, expect } from "vitest";
import { imitateEsm, reset } from "testdouble-vitest";
import * as td from "testdouble";

import * as subject from "..";
import { useNpmEnv, type NpmCliTask } from "../use-npm-env";
import { callNpmCli } from "../call-npm-cli";

vi.mock("../use-npm-env", () => imitateEsm("../use-npm-env"));
vi.mock("../call-npm-cli", () => imitateEsm("../call-npm-cli"));

describe("npm", () => {
  const authConfig = { registry: "https://example.com", token: "abc123" };
  const cliEnv = { foo: "bar" };

  afterEach(() => {
    reset();
  });

  it("should configure auth to get existing versions", async () => {
    td.when(useNpmEnv(authConfig, td.matchers.isA(Function))).thenDo(
      (_: unknown, task: NpmCliTask<unknown>) => task(cliEnv)
    );

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
});
