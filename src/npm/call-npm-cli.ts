import childProcess from "node:child_process";

export type NpmCliEnv = Record<string, string>;

export interface NpmCliOptions<TReturn> {
  env?: Record<string, string>;
  ifError?: Record<string, TReturn>;
}

const execProcess = (
  command: string,
  env: Record<string, string> = {}
): Promise<{ stdout: string; error: Error | null }> => {
  // strip Node.js environment and runtime options out of the call to NPM
  const {
    NODE_ENV: _NODE_ENV,
    NODE_OPTIONS: _NODE_OPTIONS,
    ...processEnv
  } = process.env;

  return new Promise((resolve) => {
    childProcess.exec(
      command,
      { env: { ...processEnv, ...env } },
      (error, stdout) => resolve({ stdout: stdout.trim(), error })
    );
  });
};

const parseJson = <TParsed>(value: string): TParsed | undefined => {
  try {
    return JSON.parse(value) as TParsed;
  } catch {
    return undefined;
  }
};

/**
 * Call the NPM CLI in JSON mode.
 *
 * @param command The command of the NPM CLI to call
 * @param args Any arguments to send to the command
 * @param options Customize environment variables or add an error handler.
 * @returns The parsed JSON, or stdout if unparsable.
 */
export async function callNpmCli<TReturn = string>(
  command: string,
  args: string[],
  options: NpmCliOptions<TReturn> = {}
): Promise<TReturn> {
  const { stdout, error } = await execProcess(
    ["npm", command, "--json", ...args].join(" "),
    options?.env
  );

  if (error) {
    const errorPayload = parseJson<{ error: { code?: string | null } }>(stdout);
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
