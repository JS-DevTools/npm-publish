import type { NpmCliEnv } from "./call-npm-cli";

export interface NpmAuthConfig {
  registry: string;
  token: string;
}

export type NpmCliTask<TReturn> = (env: NpmCliEnv) => Promise<TReturn>;

export async function useNpmEnv<TReturn>(
  auth: NpmAuthConfig,
  task: NpmCliTask<TReturn>
): Promise<TReturn> {
  throw new Error("useNpmEnv not implemented");
}
