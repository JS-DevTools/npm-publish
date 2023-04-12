import type { AuthConfig, PublishConfig } from "../normalize-options";
import { useNpmEnv } from "./use-npm-env";
import { callNpmCli } from "./call-npm-cli";
import { getPublishArgs } from "./get-publish-args";

export interface VersionsResult {
  "dist-tags": Record<string, string>;
  versions: string[];
}

export interface PublishResult {
  id: string;
}

/**
 *  Get a package's published versions.
 *
 * @param packageName The name of the package to get published versions for.
 * @param authConfig Registry and auth token.
 * @returns All published versions and tags.
 */
export async function getVersions(
  packageName: string,
  authConfig: AuthConfig
): Promise<VersionsResult> {
  return useNpmEnv(authConfig, (env) => {
    return callNpmCli<VersionsResult>(
      "view",
      [packageName, "dist-tags", "versions"],
      { env, ifError: { e404: { "dist-tags": {}, versions: [] } } }
    );
  });
}

/**
 *  Publish a package.
 *
 * @param publishConfig Publish options.
 * @returns Release metadata.
 */
export async function publish(
  publishConfig: PublishConfig,
  authConfig: AuthConfig
): Promise<PublishResult> {
  const publishArgs = getPublishArgs(publishConfig);

  return useNpmEnv(authConfig, (env) => {
    return callNpmCli<PublishResult>("publish", publishArgs, { env });
  });
}
