import type { PackageManifest } from "../read-manifest.js";
import type { NormalizedOptions } from "../normalize-options.js";
import {
  VIEW,
  PUBLISH,
  E404,
  EPUBLISHCONFLICT,
  callNpmCli,
  type NpmCliEnvironment,
} from "../npm/index.js";
import { compareVersions, type VersionComparison } from "./compare-versions.js";
import { getViewArguments, getPublishArguments } from "./get-arguments.js";

export interface PublishResult extends VersionComparison {
  id: string | undefined;
  files: PublishFile[];
}

export interface PublishFile {
  path: string;
  size: number;
}

/**
 * Get the currently published versions of a package and publish if needed.
 *
 * @param manifest The package to potentially publish.
 * @param options Configuration options.
 * @param environment Environment variables for the npm cli.
 * @returns Information about the publish, including if it occurred.
 */
export async function compareAndPublish(
  manifest: PackageManifest,
  options: NormalizedOptions,
  environment: NpmCliEnvironment
): Promise<PublishResult> {
  const { name, version, packageSpec } = manifest;
  const cliOptions = { environment, logger: options.logger };

  const viewArguments = getViewArguments(name, options);
  const publishArguments = getPublishArguments(packageSpec, options);
  let viewCall = await callNpmCli(VIEW, viewArguments, cliOptions);

  if (viewCall.error && viewCall.errorCode !== E404) {
    throw viewCall.error;
  }

  if (!viewCall.successData && !viewCall.error) {
    const viewWithTagArguments = getViewArguments(name, options, true);
    viewCall = await callNpmCli(VIEW, viewWithTagArguments, cliOptions);
  }

  const comparison = compareVersions(version, viewCall.successData, options);
  const publishCall = comparison.type
    ? await callNpmCli(PUBLISH, publishArguments, cliOptions)
    : { successData: undefined, errorCode: undefined, error: undefined };

  if (publishCall.error && publishCall.errorCode !== EPUBLISHCONFLICT) {
    throw publishCall.error;
  }

  const { successData: publishData } = publishCall;

  return {
    id: publishData?.id,
    files: publishData?.files ?? [],
    type: publishData ? comparison.type : undefined,
    oldVersion: comparison.oldVersion,
  };
}
