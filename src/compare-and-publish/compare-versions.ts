import semverDifference from "semver/functions/diff";
import semverGreaterThan from "semver/functions/gt";
import semverValid from "semver/functions/valid";

import { STRATEGY_ALL } from "../options.js";
import type { NormalizedOptions } from "../normalize-options.js";
import { INITIAL, DIFFERENT, type ReleaseType } from "../results.js";
import type { NpmViewData } from "../npm/index.js";

export interface VersionComparison {
  type: ReleaseType | undefined;
  oldVersion: string | undefined;
}

/**
 * Compare previously published versions with the package's current version.
 *
 * @param currentVersion The current package version.
 * @param publishedVersions The versions that have already been published.
 * @param options Configuration options
 * @returns The release type and previous version.
 */
export function compareVersions(
  currentVersion: string,
  publishedVersions: NpmViewData | undefined,
  options: NormalizedOptions
): VersionComparison {
  const { versions, "dist-tags": tags } = publishedVersions ?? {};
  const { strategy, tag: publishTag } = options;
  const oldVersion = semverValid(tags?.[publishTag.value]) ?? undefined;
  const isUnique = !versions?.includes(currentVersion);
  let type: ReleaseType | undefined;

  if (isUnique) {
    if (!oldVersion) {
      type = INITIAL;
    } else if (semverGreaterThan(currentVersion, oldVersion)) {
      type = semverDifference(currentVersion, oldVersion) ?? DIFFERENT;
    } else if (strategy.value === STRATEGY_ALL) {
      type = DIFFERENT;
    }
  }

  return { type, oldVersion };
}
