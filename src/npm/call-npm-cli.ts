import childProcess from "node:child_process";
import os from "node:os";

import * as errors from "../errors.js";
import type { Logger } from "../options.js";
import type { NpmCliEnvironment } from "./use-npm-environment.js";

export interface NpmCliOptions {
  environment: NpmCliEnvironment;
  ignoreScripts: boolean;
  logger?: Logger | undefined;
}

export interface NpmCallResult<CommandT extends string> {
  successData: SuccessData<CommandT> | undefined;
  errorCode: string | undefined;
  error: Error | undefined;
}

type SuccessData<T extends string> = T extends typeof VIEW
  ? NpmViewData
  : T extends typeof PUBLISH
    ? NpmPublishData
    : unknown;

export interface NpmViewData {
  "dist-tags": Record<string, string>;
  versions: string[];
}
export interface NpmPublishData {
  id: string;
  files: { path: string; size: number }[];
}

export const VIEW = "view";
export const PUBLISH = "publish";

export const E404 = "E404";
export const EPUBLISHCONFLICT = "EPUBLISHCONFLICT";

const IS_WINDOWS = os.platform() === "win32";
const NPM = IS_WINDOWS ? "npm.cmd" : "npm";
const JSON_MATCH_RE = /(\{[\s\S]*\})/mu;

const baseArguments = (options: NpmCliOptions) =>
  options.ignoreScripts ? ["--ignore-scripts", "--json"] : ["--json"];

/**
 * Call the NPM CLI in JSON mode.
 *
 * @param command The command of the NPM CLI to call
 * @param cliArguments Any arguments to send to the command
 * @param options Customize environment variables or add an error handler.
 * @returns The parsed JSON, or stdout if unparsable.
 */
export async function callNpmCli<CommandT extends string>(
  command: CommandT,
  cliArguments: string[],
  options: NpmCliOptions
): Promise<NpmCallResult<CommandT>> {
  const { stdout, stderr, exitCode } = await execNpm(
    [command, ...baseArguments(options), ...cliArguments],
    options.environment,
    options.logger
  );

  let successData;
  let errorCode;
  let error;

  if (exitCode === 0) {
    successData = parseJson<SuccessData<CommandT>>(stdout);
  } else {
    const errorPayload = parseJson<{ error?: { code?: unknown } }>(
      stdout,
      stderr
    );

    if (errorPayload?.error?.code) {
      errorCode = String(errorPayload.error.code).toUpperCase();
    }

    error = new errors.NpmCallError(command, exitCode, stderr);
  }

  return { successData, errorCode, error };
}

/**
 * Execute the npm CLI.
 *
 * @param commandArguments Npm subcommand and arguments.
 * @param environment Environment variables.
 * @param logger Optional logger.
 * @returns Stdout, stderr, and the exit code.
 */
async function execNpm(
  commandArguments: string[],
  environment: Record<string, string>,
  logger?: Logger
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  logger?.debug?.(`Running command: ${NPM} ${commandArguments.join(" ")}`);

  return new Promise((resolve) => {
    let stdout = "";
    let stderr = "";

    const npm = childProcess.spawn(NPM, commandArguments, {
      env: { ...process.env, ...environment },
      shell: IS_WINDOWS,
    });

    npm.stdout.on("data", (data: string) => (stdout += data));
    npm.stderr.on("data", (data: string) => (stderr += data));
    npm.on("close", (code) => {
      logger?.debug?.(`Received stdout: ${stdout}`);
      logger?.debug?.(`Received stderr: ${stderr}`);

      resolve({
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: code ?? 0,
      });
    });
  });
}

/**
 * Parse CLI outputs for JSON data.
 *
 * Certain versions of the npm CLI may intersperse JSON with human-readable
 * output, which this function accounts for.
 *
 * @param values CLI outputs to check
 * @returns Parsed JSON, if able to parse.
 */
function parseJson<TParsed>(...values: string[]): TParsed | undefined {
  for (const value of values) {
    const jsonValue = JSON_MATCH_RE.exec(value)?.[1];

    if (jsonValue) {
      try {
        return JSON.parse(jsonValue) as TParsed;
      } catch {
        return undefined;
      }
    }
  }

  return undefined;
}
