import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { callNpmCli, type NpmCliEnv } from "./call-npm-cli";

export interface NpmAuthConfig {
  registry: string;
  token: string;
}

export type NpmCliTask<TReturn> = (env: NpmCliEnv) => Promise<TReturn>;

/**
 * Create a temporary .npmrc file with the given auth token.
 * Copies the existing user config.
 *
 * @param auth Registry and token.
 * @param task A function called with the configured environment.
 * After the function resolves, the temporary .npmrc file will be removed.
 */
export async function useNpmEnv<TReturn>(
  auth: NpmAuthConfig,
  task: NpmCliTask<TReturn>
): Promise<TReturn> {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "npm-publish-"));
  const tempConfigFile = path.join(tempDir, ".npmrc");
  const existingConfigFile = await callNpmCli<string>("config", [
    "get",
    "userconfig",
  ]);
  let config = "";

  try {
    config = await fs.readFile(existingConfigFile, "utf8");
  } catch (error: unknown) {
    if (
      !(error instanceof Error) ||
      (error as NodeJS.ErrnoException).code !== "ENOENT"
    ) {
      throw error;
    }
  }

  const { registry, token } = auth;
  const registryUrl = new URL(registry);

  config += `
  ; added by jsdevtools/npm-publish
  //${registryUrl.hostname}/:authToken=\${NODE_AUTH_TOKEN}
  `;

  await fs.writeFile(tempConfigFile, config, "utf8");

  try {
    return await task({
      /* eslint-disable @typescript-eslint/naming-convention */
      NODE_AUTH_TOKEN: token,
      npm_config_userconfig: tempConfigFile,
      /* eslint-enable @typescript-eslint/naming-convention */
    });
  } finally {
    await fs.rm(tempDir, { force: true, recursive: true });
  }
}
