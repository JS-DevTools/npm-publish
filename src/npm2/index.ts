import { useNpmEnv, type NpmAuthConfig } from "./use-npm-env";
import { callNpmCli, type NpmCliEnv } from "./call-npm-cli";

export interface VersionsResult {
  "dist-tags": Record<string, string>;
  versions: string[];
}

export interface PublishResult {
  id: string;
  name: string;
  version: string;
}

export interface PublishConfig {
  packageSpec?: string;
  tag?: string;
  access?: string;
  dryRun?: boolean;
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
  authConfig: NpmAuthConfig
): Promise<VersionsResult> {
  return useNpmEnv(authConfig, (env) => {
    return callNpmCli<VersionsResult>(
      "view",
      [packageName, "dist-tags", "versions"],
      { env, ifError: { e404: { "dist-tags": {}, versions: [] } } }
    );
  });
}

export async function publish(
  publishConfig: PublishConfig,
  authConfig: NpmAuthConfig
): Promise<PublishResult> {
  return useNpmEnv(authConfig, (env) => {
    return callNpmCli<PublishResult>("publish", []);
  });
}
