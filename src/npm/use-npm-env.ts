import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import type { AuthConfig } from "../normalize-options";
import { callNpmCli, type NpmCliEnv } from "./call-npm-cli";

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
  auth: AuthConfig,
  task: NpmCliTask<TReturn>
): Promise<TReturn> {
  const { registryUrl, token } = auth;
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "npm-publish-"));
  const tempConfigFile = path.join(tempDir, ".npmrc");
  const userConfigFile = await callNpmCli("config", ["get", "userconfig"]);

  const userConfig = await fs
    .readFile(userConfigFile, "utf8")
    .catch((error: NodeJS.ErrnoException) => {
      if (error.code === "ENOENT") return "";
      throw error;
    });

  const config = [
    `; copied from ${userConfig}`,
    userConfig,
    "; added by jsdevtools/npm-publish",
    `registry=${registryUrl.value.href}`,
    `//${registryUrl.value.hostname}/:authToken=\${NODE_AUTH_TOKEN}`,
    "",
  ].join(os.EOL);

  const env: NpmCliEnv = { npm_config_userconfig: tempConfigFile };

  if (token.value) {
    env.NODE_AUTH_TOKEN = token.value;
  }

  await fs.writeFile(tempConfigFile, config, "utf8");

  try {
    return await task(env);
  } finally {
    await fs.rm(tempDir, { force: true, recursive: true });
  }
}
