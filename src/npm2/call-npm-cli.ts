export type NpmCliEnv = Record<string, string>;

export interface NpmCliOptions<TReturn> {
  env: Record<string, string>;
  ifError?: Record<string, TReturn>;
}

export async function callNpmCli<TReturn>(
  command: string,
  args: string[],
  options: NpmCliOptions<TReturn>
): Promise<TReturn> {
  throw new Error("callNpmCli not implemented");
}
