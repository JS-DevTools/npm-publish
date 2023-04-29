import { vi, describe, it, beforeEach, afterEach, expect } from "vitest";
import { imitateEsm, reset } from "testdouble-vitest";
import * as td from "testdouble";

import type { Logger } from "../../options.js";
import type { NormalizedOptions } from "../../normalize-options.js";

import * as subject from "../index.js";
import { useNpmEnvironment, type NpmCliTask } from "../use-npm-environment.js";
import { callNpmCli } from "../call-npm-cli.js";
import { getViewArguments, getPublishArguments } from "../get-arguments.js";

vi.mock("../use-npm-environment", () => imitateEsm("../use-npm-environment"));
vi.mock("../call-npm-cli", () => imitateEsm("../call-npm-cli"));
vi.mock("../get-arguments", () => imitateEsm("../get-arguments"));

describe("npm", () => {
  const environment = { foo: "bar" };
  const logger = { debug: (message: string) => void message } as Logger;
  const options = {
    logger,
    token: "abc123",
    tag: { value: "cool-tag" },
  } as NormalizedOptions;

  beforeEach(() => {
    td.when(useNpmEnvironment(options, td.matchers.isA(Function))).thenDo(
      (_: unknown, task: NpmCliTask<unknown>) => task(environment)
    );
  });

  afterEach(() => {
    reset();
  });

  it("should get existing versions", async () => {
    td.when(getViewArguments("@example/cool-package", options)).thenReturn([
      "@example/cool-package",
      "dist-tags",
      "versions",
    ]);

    td.when(
      getViewArguments("@example/cool-package", options, true)
    ).thenReturn(["@example/cool-package@cool-tag", "dist-tags", "versions"]);

    td.when(
      callNpmCli<subject.PublishedVersions>(
        "view",
        ["@example/cool-package", "dist-tags", "versions"],
        {
          logger,
          environment,
          ifError: { e404: { "dist-tags": {}, versions: [] } },
          retryIfEmpty: [
            "@example/cool-package@cool-tag",
            "dist-tags",
            "versions",
          ],
        }
      )
    ).thenResolve({
      "dist-tags": { latest: "1.2.3" },
      versions: ["1.2.3", "4.5.6"],
    });

    const result = await subject.getVersions("@example/cool-package", options);

    expect(result).toEqual({
      "dist-tags": { latest: "1.2.3" },
      versions: ["1.2.3", "4.5.6"],
    });
  });

  it("should publish a package", async () => {
    td.when(getPublishArguments("./package", options)).thenReturn([
      "--tag",
      "next",
    ]);
    td.when(
      callNpmCli<subject.PublishResult>("publish", ["--tag", "next"], {
        environment,
        logger,
      })
    ).thenResolve({ id: "@example/cool-package@1.2.3" });

    const result = await subject.publish("./package", options);

    expect(result).toEqual({ id: "@example/cool-package@1.2.3" });
  });
});
