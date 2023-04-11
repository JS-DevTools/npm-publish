import { useNpmEnv, type NpmAuthConfig } from "./use-npm-env";
import { callNpmCli, type NpmCliEnv } from "./call-npm-cli";

export interface VersionsResult {
  "dist-tags": Record<string, string>;
  versions: string[];
}

export async function getVersions(
  packageName: string,
  authConfig: NpmAuthConfig
): Promise<VersionsResult> {
  return useNpmEnv(authConfig, (env) => getVersionWithCliEnv(packageName, env));
}

async function getVersionWithCliEnv(
  packageName: string,
  env: NpmCliEnv
): Promise<VersionsResult> {
  return callNpmCli<VersionsResult>(
    "view",
    [packageName, "dist-tags", "versions"],
    { env, ifError: { e404: { "dist-tags": {}, versions: [] } } }
  );
}
