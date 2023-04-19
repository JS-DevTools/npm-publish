import childProcess from "node:child_process";

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
): Promise<{ stdout: string; stderr: string; error: Error | null }> => {
  logger?.debug?.(`Running command: npm ${commandArguments.join(" ")}`);

  return new Promise((resolve) => {
    const child = childProcess.execFile(
      "npm",
      commandArguments,
      { env: { ...process.env, ...environment } },
      (error, stdout, stderr) => {
        logger?.debug?.(`exit code: ${child.exitCode ?? 0}`);
        logger?.debug?.(`stdout: ${stdout.trim()}`);
        logger?.debug?.(`stderr: ${stderr.trim()}`);
        return resolve({ stdout: stdout.trim(), stderr: stderr.trim(), error });
      }
    );
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
  const { stdout, stderr, error } = await execNpm(
    [command, "--ignore-scripts", "--json", ...cliArguments],
    options.environment,
    options.logger
  );

  if (error) {
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

    throw error;
  }

  return parseJson(stdout) ?? (stdout as unknown as TReturn);
}
