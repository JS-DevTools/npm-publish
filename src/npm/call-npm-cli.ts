import childProcess from "node:child_process";

import type { NpmCliEnvironment } from "./use-npm-environment.js";

export interface NpmCliOptions<TReturn> {
  environment?: NpmCliEnvironment;
  ifError?: Record<string, TReturn>;
}

const JSON_MATCH_RE = /(\{[\s\S]*\})/mu;

const execProcess = (
  command: string,
  environment: Record<string, string> = {}
): Promise<{ stdout: string; stderr: string; error: Error | null }> => {
  return new Promise((resolve) => {
    childProcess.exec(
      command,
      { env: { ...process.env, ...environment } },
      (error, stdout, stderr) => {
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
  const { stdout, stderr, error } = await execProcess(
    ["npm", command, "--ignore-scripts", "--json", ...cliArguments].join(" "),
    options.environment
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
