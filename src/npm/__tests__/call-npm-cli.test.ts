import os from "node:os";
import path from "node:path";
import { describe, it, expect } from "vitest";

import * as errors from "../../errors.js";
import * as subject from "../call-npm-cli.js";

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

    await expect(result).rejects.toThrow(errors.NpmCallError);
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
    const customPath = path.join(os.homedir(), "foo", ".npmrc");

    const result = await subject.callNpmCli("config", ["get", "userconfig"], {
      environment: {
        npm_config_userconfig: customPath,
      },
    });

    expect(result).toEqual(customPath);
  });

  it("should return empty object if stdout is empty", async () => {
    const result = await subject.callNpmCli("config", ["get", "scope"], {
      environment: {
        npm_config_scope: "",
      },
    });

    expect(result).toEqual({});
  });

  it("should retry a command with new arguments if empty", async () => {
    const result = await subject.callNpmCli("config", ["get", "scope"], {
      retryIfEmpty: ["get", "preid"],
      environment: {
        npm_config_scope: "",
        npm_config_preid: "hello",
      },
    });

    expect(result).toEqual("hello");
  });
});
