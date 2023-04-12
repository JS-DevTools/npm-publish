import { describe, it, expect } from "vitest";

import * as subject from "../call-npm-cli";

describe("callNpmCli", () => {
  it("should call the NPM CLI in JSON mode", async () => {
    const result = await subject.callNpmCli("config", ["list"]);

    expect(result).toMatchObject({ json: true });
  });

  it("should call the NPM CLI in JSON mode", async () => {
    const result = await subject.callNpmCli("config", ["list"]);

    expect(result).toMatchObject({ json: true, "ignore-scripts": true });
  });

  it("should raise if error", async () => {
    const result = subject.callNpmCli("explain", ["not-a-real-package"]);

    await expect(result).rejects.toThrow(/No dependencies found/);
  });

  it("should map an error code to a return value", async () => {
    const result = await subject.callNpmCli("config", [], {
      ifError: { eusage: 42 },
    });

    expect(result).toEqual(42);
  });

  it("should return plain strings", async () => {
    const result = await subject.callNpmCli("config", ["get", "userconfig"]);

    expect(result).toMatch(/^.+\.npmrc$/);
  });

  it("should allow the environment to be overriden", async () => {
    const result = await subject.callNpmCli("config", ["get", "userconfig"], {
      env: { npm_config_userconfig: "/foo/bar/.npmrc" },
    });

    expect(result).toEqual("/foo/bar/.npmrc");
  });
});
