import {
  valid as semverValid,
  gt as semverGreaterThan,
  diff as semverDifference,
  type ReleaseType as SemverReleaseType,
} from "semver";

import { STRATEGY_ALL } from "./options.js";
import type { PublishConfig } from "./normalize-options.js";
import type { PublishedVersions } from "./npm/index.js";

export type ReleaseType = SemverReleaseType | typeof INITIAL | typeof DIFFERENT;

export interface VersionComparison {
  releaseType: ReleaseType | undefined;
  previousVersion: string | undefined;
}

const INITIAL = "initial";
const DIFFERENT = "different";

/**
 * Compare previously published versions with the package's current version.
 *
 * @param version The current package version.
 * @param publishedVersions The versions that have already been published.
 * @param publishConfig Tag and version comparison strategy.
 * @returns The release type and previous version.
 */
export function compareVersions(
  version: string,
  publishedVersions: PublishedVersions,
  publishConfig: PublishConfig
): VersionComparison {
  const { versions: existingVersions, "dist-tags": tags } = publishedVersions;
  const { strategy, tag: publishTag } = publishConfig;
  const previousVersion = semverValid(tags[publishTag.value]) ?? undefined;
  const isUnique = !existingVersions.includes(version);
  let releaseType: ReleaseType | undefined;

  if (isUnique) {
    if (!previousVersion) {
      releaseType = INITIAL;
    } else if (semverGreaterThan(version, previousVersion)) {
      releaseType = semverDifference(version, previousVersion) ?? undefined;
    } else if (strategy.value === STRATEGY_ALL) {
      releaseType = DIFFERENT;
    }
  }

  return { releaseType, previousVersion };
}
