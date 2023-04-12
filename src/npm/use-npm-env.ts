import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { type NpmCliEnv } from "./call-npm-cli";

export interface NpmAuthConfig {
  registry: string;
  token: string;
}

export type NpmCliTask<TReturn> = (env: NpmCliEnv) => Promise<TReturn>;

/**
 * Create a temporary .npmrc file with the given auth token,
 * and call a task with env vars set to use that .npmrc.
 *
 * @param auth Registry and token.
 * @param task A function called with the configured environment.
 * After the function resolves, the temporary .npmrc file will be removed.
 * @returns The resolved value of `task`
 */
export async function useNpmEnv<TReturn>(
  auth: NpmAuthConfig,
  task: NpmCliTask<TReturn>
): Promise<TReturn> {
  const { registry, token } = auth;
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "npm-publish-"));
  const tempConfigFile = path.join(tempDir, ".npmrc");
  const registryUrl = new URL(registry);

  const config = [
    "; added by jsdevtools/npm-publish",
    `registry=${registry}`,
    `//${registryUrl.hostname}/:authToken=\${NODE_AUTH_TOKEN}`,
    "",
  ].join(os.EOL);

  const env = {
    /* eslint-disable @typescript-eslint/naming-convention */
    NODE_AUTH_TOKEN: token,
    npm_config_userconfig: tempConfigFile,
    /* eslint-enable @typescript-eslint/naming-convention */
  };

  await fs.writeFile(tempConfigFile, config, "utf8");

  try {
    return await task(env);
  } finally {
    await fs.rm(tempDir, { force: true, recursive: true });
  }
}
