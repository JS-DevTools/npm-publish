import { vi, describe, it, beforeEach, afterEach } from "vitest";
import { imitateEsm, reset } from "testdouble-vitest";
import * as td from "testdouble";

import { npmPublish } from "../../index.js";
import * as core from "../core.js";

vi.mock("../../index", () => imitateEsm("../../index"));
vi.mock("../core", () => imitateEsm("../core"));

describe("run", () => {
  beforeEach(() => {
    vi.stubEnv("RUNNER_TEMP", "/path/to/temp");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
    reset();
  });

  it("should pass input to options", async () => {
    td.when(core.getRequiredSecretInput("token")).thenReturn("abc123");
    td.when(core.getInput("package")).thenReturn("./package.json");
    td.when(core.getInput("registry")).thenReturn("https://example.com");
    td.when(core.getInput("tag")).thenReturn("next");
    td.when(core.getInput("access")).thenReturn("restricted");
    td.when(core.getBooleanInput("provenance")).thenReturn(true);
    td.when(core.getInput("strategy")).thenReturn("all");
    td.when(core.getBooleanInput("dry-run")).thenReturn(true);

    td.when(
      npmPublish({
        token: "abc123",
        package: "./package.json",
        registry: "https://example.com",
        tag: "next",
        access: "restricted",
        provenance: true,
        strategy: "all",
        dryRun: true,
        logger: core.logger,
        temporaryDirectory: "/path/to/temp",
      })
    ).thenResolve({
      id: "cool-package@1.2.3",
      name: "cool-package",
      version: "1.2.3",
      type: "major",
      oldVersion: "0.1.2",
      registry: new URL("https://example.com/registry"),
      tag: "latest",
      access: "public",
      strategy: "upgrade",
      dryRun: false,
    });

    await import("../main.js");

    td.verify(core.setOutput("id", "cool-package@1.2.3", ""));
    td.verify(core.setOutput("name", "cool-package"));
    td.verify(core.setOutput("version", "1.2.3"));
    td.verify(core.setOutput("type", "major", ""));
    td.verify(core.setOutput("old-version", "0.1.2", ""));
    td.verify(core.setOutput("registry", "https://example.com/registry"));
    td.verify(core.setOutput("tag", "latest"));
    td.verify(core.setOutput("access", "public", "default"));
    td.verify(core.setOutput("strategy", "upgrade"));
    td.verify(core.setOutput("dry-run", false));
  });

  it("should fail the action if something raises", async () => {
    const error = new Error("oh no");

    td.when(core.getRequiredSecretInput("token")).thenReturn("abc123");
    td.when(core.getInput("package")).thenReturn("./package.json");
    td.when(core.getInput("registry")).thenReturn("https://example.com");
    td.when(core.getInput("tag")).thenReturn("next");
    td.when(core.getInput("access")).thenReturn("restricted");
    td.when(core.getBooleanInput("provenance")).thenReturn(true);
    td.when(core.getInput("strategy")).thenReturn("all");
    td.when(core.getBooleanInput("dry-run")).thenReturn(true);

    td.when(
      npmPublish({
        token: "abc123",
        package: "./package.json",
        registry: "https://example.com",
        tag: "next",
        access: "restricted",
        provenance: true,
        strategy: "all",
        dryRun: true,
        logger: core.logger,
        temporaryDirectory: "/path/to/temp",
      })
    ).thenReject(error);

    await import("../main.js");

    td.verify(core.setFailed(error), { times: 1 });
  });
});
