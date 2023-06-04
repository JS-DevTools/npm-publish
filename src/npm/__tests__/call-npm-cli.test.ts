import { describe, it } from "vitest";

import * as errors from "../../errors.js";
import * as subject from "../call-npm-cli.js";

const TIMEOUT = 10_000;

describe.concurrent("callNpmCli", () => {
  it(
    "should call npm CLI",
    async ({ expect }) => {
      const result = await subject.callNpmCli("config", ["list"], {
        ignoreScripts: true,
        environment: {
          npm_config_scope: "@cool-scope",
        },
      });

      expect(result).toEqual({
        successData: expect.objectContaining({
          json: true,
          "ignore-scripts": true,
          scope: "@cool-scope",
        }),
        errorCode: undefined,
        error: undefined,
      });
    },
    TIMEOUT
  );

  it(
    "should call npm CLI without ignoring scripts",
    async ({ expect }) => {
      const result = await subject.callNpmCli("config", ["list"], {
        ignoreScripts: false,
        environment: {
          npm_config_scope: "@cool-scope",
        },
      });

      expect(result).toMatchObject({
        successData: expect.objectContaining({ "ignore-scripts": false }),
      });
    },
    TIMEOUT
  );

  it(
    "should return undefined if no JSON in output",
    async ({ expect }) => {
      const result = await subject.callNpmCli("config", ["get", "scope"], {
        ignoreScripts: true,
        environment: {
          npm_config_scope: "",
        },
      });

      expect(result).toEqual({
        successData: undefined,
        errorCode: undefined,
        error: undefined,
      });
    },
    TIMEOUT
  );

  it(
    "should return error details if error",
    async ({ expect }) => {
      const result = await subject.callNpmCli("config", [], {
        ignoreScripts: true,
        environment: {},
      });

      expect(result).toEqual({
        successData: undefined,
        errorCode: "EUSAGE",
        error: expect.any(errors.NpmCallError),
      });
    },
    TIMEOUT
  );
});
