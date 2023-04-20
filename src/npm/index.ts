import type { NormalizedOptions } from "../normalize-options.js";
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
 * Get a package's published versions.
 *
 * @param packageName The name of the package to get published versions for.
 * @param options Configuration options.
 * @returns All published versions and tags.
 */
export async function getVersions(
  packageName: string,
  options: NormalizedOptions
): Promise<PublishedVersions> {
  return useNpmEnvironment(options, (environment) => {
    return callNpmCli<PublishedVersions>(
      "view",
      [packageName, "dist-tags", "versions"],
      {
        logger: options.logger,
        environment,
        ifError: { e404: { "dist-tags": {}, versions: [] } },
      }
    );
  });
}

/**
 * Publish a package.
 *
 * @param packageSpec Package specification to pass to npm.
 * @param options Configuration options.
 * @returns Release metadata.
 */
export async function publish(
  packageSpec: string,
  options: NormalizedOptions
): Promise<PublishResult> {
  const publishArguments = getPublishArguments(packageSpec, options);

  return useNpmEnvironment(options, (environment) => {
    return callNpmCli<PublishResult>("publish", publishArguments, {
      logger: options.logger,
      environment,
    });
  });
}
