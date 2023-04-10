export interface NpmCliOptions {
  extraArgs: string[];
  env: Record<string, string>;
}

export interface NpmCliError {
  error: Error;
  code: string | null;
}

export async function callNpmCli<ReturnType>(
  command: string,
  args: string[],
  options: NpmCliOptions
): Promise<ReturnType | NpmCliError> {
  throw new Error("callNpmCli not implemented");
}
