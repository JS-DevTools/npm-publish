import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import type { PackageManifest } from "../read-manifest.js";
import type { NormalizedOptions } from "../normalize-options.js";

export type NpmCliEnvironment = Record<string, string>;

export type NpmCliTask<TReturn> = (
  manifest: PackageManifest,
  options: NormalizedOptions,
  environment: NpmCliEnvironment
) => Promise<TReturn>;

/**
 * Create a temporary .npmrc file with the given auth token, and call a task
 * with env vars set to use that .npmrc.
 *
 * @param manifest Pacakge metadata.
 * @param options Configuration options.
 * @param task A function called with the configured environment. After the
 *   function resolves, the temporary .npmrc file will be removed.
 * @returns The resolved value of `task`
 */
export async function useNpmEnvironment<TReturn>(
  manifest: PackageManifest,
  options: NormalizedOptions,
  task: NpmCliTask<TReturn>
): Promise<TReturn> {
  const { registry, token, logger, temporaryDirectory } = options;
  const npmrcDirectory = await fs.mkdtemp(
    path.join(temporaryDirectory, "npm-publish-")
  );
  const npmrc = path.join(npmrcDirectory, ".npmrc");
  const environment = {
    NODE_AUTH_TOKEN: token,
    npm_config_userconfig: npmrc,
  };

  const config = [
    "; created by jsdevtools/npm-publish",
    `//${registry.host}${registry.pathname}:_authToken=\${NODE_AUTH_TOKEN}`,
    `registry=${registry.href}`,
    "",
  ].join(os.EOL);

  await fs.writeFile(npmrc, config, "utf8");

  logger?.debug?.(`Temporary .npmrc created at ${npmrc}\n${config}`);

  try {
    return await task(manifest, options, environment);
  } finally {
    await fs.rm(npmrcDirectory, { force: true, recursive: true });
  }
}
