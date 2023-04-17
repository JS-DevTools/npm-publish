import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import type { AuthConfig } from "../normalize-options.js";

export type NpmCliEnvironment = Record<string, string>;

export type NpmCliTask<TReturn> = (
  environment: NpmCliEnvironment
) => Promise<TReturn>;

/**
 * Create a temporary .npmrc file with the given auth token,
 * and call a task with env vars set to use that .npmrc.
 *
 * @param auth Registry and token.
 * @param task A function called with the configured environment.
 * After the function resolves, the temporary .npmrc file will be removed.
 * @returns The resolved value of `task`
 */
export async function useNpmEnvironment<TReturn>(
  auth: AuthConfig,
  task: NpmCliTask<TReturn>
): Promise<TReturn> {
  const { registry, token } = auth;
  const npmrcDirectory = await fs.mkdtemp(
    path.join(os.tmpdir(), "npm-publish-")
  );
  const npmrc = path.join(npmrcDirectory, ".npmrc");

  const config = [
    "; created by jsdevtools/npm-publish",
    `//${registry.value.hostname}/:authToken=\${NODE_AUTH_TOKEN}`,
    registry.isDefault ? "" : `registry=${registry.value.href}`,
    "",
  ].join(os.EOL);

  await fs.writeFile(npmrc, config, "utf8");

  try {
    return await task({
      NODE_AUTH_TOKEN: token.value,
      npm_config_userconfig: npmrc,
    });
  } finally {
    await fs.rm(npmrcDirectory, { force: true, recursive: true });
  }
}
