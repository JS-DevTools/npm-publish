import { vi, describe, it, beforeEach, expect } from "vitest";
import { when } from "vitest-when";

import { npmPublish } from "../../index.js";
import * as core from "../core.js";
import * as subject from "../main.js";

vi.mock("../../index");
vi.mock("../core");

describe("run", () => {
  beforeEach(() => {
    vi.stubEnv("RUNNER_TEMP", "/path/to/temp");

    when(core.getRequiredSecretInput).calledWith("token").thenReturn("abc123");
    when(core.getInput<string>)
      .calledWith("package")
      .thenReturn("./package.json");
    when(core.getInput<string>)
      .calledWith("registry")
      .thenReturn("https://example.com");
    when(core.getInput<string>)
      .calledWith("tag")
      .thenReturn("next");
    when(core.getInput<string>)
      .calledWith("access")
      .thenReturn("restricted");
    when(core.getBooleanInput).calledWith("provenance").thenReturn(true);
    when(core.getInput<string>)
      .calledWith("strategy")
      .thenReturn("all");
    when(core.getBooleanInput).calledWith("ignore-scripts").thenReturn(false);
    when(core.getBooleanInput).calledWith("dry-run").thenReturn(true);
  });

  it("should pass input to options", async () => {
    when(npmPublish)
      .calledWith({
        token: "abc123",
        package: "./package.json",
        registry: "https://example.com",
        tag: "next",
        access: "restricted",
        provenance: true,
        strategy: "all",
        ignoreScripts: false,
        dryRun: true,
        logger: core.logger,
        temporaryDirectory: "/path/to/temp",
      })
      .thenResolve({
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

    await subject.main();

    expect(core.setOutput).toHaveBeenCalledWith("id", "cool-package@1.2.3", "");
    expect(core.setOutput).toHaveBeenCalledWith("name", "cool-package");
    expect(core.setOutput).toHaveBeenCalledWith("version", "1.2.3");
    expect(core.setOutput).toHaveBeenCalledWith("type", "major", "");
    expect(core.setOutput).toHaveBeenCalledWith("old-version", "0.1.2", "");
    expect(core.setOutput).toHaveBeenCalledWith(
      "registry",
      "https://example.com/registry"
    );
    expect(core.setOutput).toHaveBeenCalledWith("tag", "latest");
    expect(core.setOutput).toHaveBeenCalledWith("access", "public", "default");
    expect(core.setOutput).toHaveBeenCalledWith("strategy", "upgrade");
    expect(core.setOutput).toHaveBeenCalledWith("dry-run", false);
  });

  it("should fail the action if something raises", async () => {
    const error = new Error("oh no");

    when(npmPublish)
      .calledWith({
        token: "abc123",
        package: "./package.json",
        registry: "https://example.com",
        tag: "next",
        access: "restricted",
        provenance: true,
        strategy: "all",
        ignoreScripts: false,
        dryRun: true,
        logger: core.logger,
        temporaryDirectory: "/path/to/temp",
      })
      .thenReject(error);

    await subject.main();

    expect(core.setFailed).toHaveBeenCalledWith(error);
  });
});
