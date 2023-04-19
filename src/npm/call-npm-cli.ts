import childProcess from "node:child_process";

import * as errors from "../errors.js";
import type { Logger } from "../options.js";
import type { NpmCliEnvironment } from "./use-npm-environment.js";

export interface NpmCliOptions<TReturn> {
  environment?: NpmCliEnvironment;
  ifError?: Record<string, TReturn>;
  logger?: Logger | undefined;
}

const JSON_MATCH_RE = /(\{[\s\S]*\})/mu;

const execNpm = (
  commandArguments: string[],
  environment: Record<string, string> = {},
  logger?: Logger
): Promise<{ stdout: string; stderr: string; exitCode: number }> => {
  logger?.debug?.(`Running command: npm ${commandArguments.join(" ")}`);

  return new Promise((resolve) => {
    let stdout = "";
    let stderr = "";

    const npm = childProcess.spawn("npm", commandArguments, {
      env: { ...process.env, ...environment },
    });

    npm.stdout.on("data", (data) => (stdout += data));
    npm.stderr.on("data", (data) => (stderr += data));
    npm.on("close", (code) => {
      resolve({
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: code ?? 0,
      });
    });
  });
};

const parseJson = <TParsed>(...values: string[]): TParsed | undefined => {
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
};

/**
 * Call the NPM CLI in JSON mode.
 *
 * @param command The command of the NPM CLI to call
 * @param cliArguments Any arguments to send to the command
 * @param options Customize environment variables or add an error handler.
 * @returns The parsed JSON, or stdout if unparsable.
 */
export async function callNpmCli<TReturn = string>(
  command: string,
  cliArguments: string[],
  options: NpmCliOptions<TReturn> = {}
): Promise<TReturn> {
  const { stdout, stderr, exitCode } = await execNpm(
    [command, "--ignore-scripts", "--json", ...cliArguments],
    options.environment,
    options.logger
  );

  if (exitCode !== 0) {
    const errorPayload = parseJson<{ error?: { code?: string | null } }>(
      stdout,
      stderr
    );
    const errorCode = errorPayload?.error?.code?.toLowerCase();

    if (
      typeof errorCode === "string" &&
      options.ifError &&
      errorCode in options.ifError
    ) {
      return options.ifError[errorCode] as TReturn;
    }

    throw new errors.NpmCalError(command, exitCode, stderr);
  }

  return parseJson(stdout) ?? (stdout as unknown as TReturn);
}
