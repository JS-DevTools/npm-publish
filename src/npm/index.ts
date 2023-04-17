import type { Logger } from "../options.js";
import type { AuthConfig, PublishConfig } from "../normalize-options.js";
import { useNpmEnvironment } from "./use-npm-environment.js";
import { callNpmCli } from "./call-npm-cli.js";
import { getPublishArguments } from "./get-publish-arguments.js";

export interface PublishedVersions {
  "dist-tags": Record<string, string>;
  versions: string[];
}

export interface PublishFile {
  path: string;
  size: number;
}

export interface PublishResult {
  id: string;
  files: PublishFile[];
}

/**
 *  Get a package's published versions.
 *
 * @param packageName The name of the package to get published versions for.
 * @param authConfig Registry and auth token.
 * @param logger Optional logger.
 * @returns All published versions and tags.
 */
export async function getVersions(
  packageName: string,
  authConfig: AuthConfig,
  logger?: Logger
): Promise<PublishedVersions> {
  return useNpmEnvironment(authConfig, (environment) => {
    return callNpmCli<PublishedVersions>(
      "view",
      [packageName, "dist-tags", "versions"],
      {
        logger,
        environment,
        ifError: { e404: { "dist-tags": {}, versions: [] } },
      }
    );
  });
}

/**
 *  Publish a package.
 *
 * @param packageSpec Package specification to pass to npm.
 * @param publishConfig Publish configuration.
 * @param authConfig Registry and auth token.
 * @param logger Optional logger.
 * @returns Release metadata.
 */
export async function publish(
  packageSpec: string,
  publishConfig: PublishConfig,
  authConfig: AuthConfig,
  logger?: Logger
): Promise<PublishResult> {
  const publishArguments = getPublishArguments(packageSpec, publishConfig);

  return useNpmEnvironment(authConfig, (environment) => {
    return callNpmCli<PublishResult>("publish", publishArguments, {
      logger,
      environment,
    });
  });
}
