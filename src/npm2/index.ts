import { NpmPublishError } from "../error";
import type { NpmClient, NpmClientOptions, GetVersionsResult } from "./client";
import { configureNpmCli, removeNpmCliConfig } from "./configure-npm";
import { callNpmCli, type NpmCliOptions } from "./call-npm-cli";

export * from "./client";

export async function createNpmClient(
  options: NpmClientOptions
): Promise<NpmClient> {
  const npmCliOptions = await configureNpmCli(options);

  return {
    getVersions: (packageName: string) =>
      getVersions(packageName, npmCliOptions),
    cleanup: () => removeNpmCliConfig(npmCliOptions),
  };
}

async function getVersions(
  packageName: string,
  cliOptions: NpmCliOptions
): Promise<GetVersionsResult> {
  const result = await callNpmCli<GetVersionsResult>(
    "view",
    [packageName, "dist-tags", "versions"],
    cliOptions
  );

  if ("error" in result) {
    if (result.code !== "E404") {
      throw new NpmPublishError(
        `Unable to get published versions of ${packageName}`,
        result.error
      );
    }

    return { "dist-tags": {}, versions: [] };
  }

  return result;
}
