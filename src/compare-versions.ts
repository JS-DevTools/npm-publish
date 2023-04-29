import semverDifference from "semver/functions/diff.js";
import semverGreaterThan from "semver/functions/gt.js";
import semverValid from "semver/functions/valid.js";
import type { ReleaseType as SemverReleaseType } from "semver";

import { STRATEGY_ALL } from "./options.js";
import type { NormalizedOptions } from "./normalize-options.js";
import type { PublishedVersions } from "./npm/index.js";

export type ReleaseType = SemverReleaseType | typeof INITIAL | typeof DIFFERENT;

export interface VersionComparison {
  type: ReleaseType | undefined;
  oldVersion: string | undefined;
}

const INITIAL = "initial";
const DIFFERENT = "different";

/**
 * Compare previously published versions with the package's current version.
 *
 * @param version The current package version.
 * @param publishedVersions The versions that have already been published.
 * @param options Configuration options
 * @returns The release type and previous version.
 */
export function compareVersions(
  version: string,
  publishedVersions: PublishedVersions,
  options: NormalizedOptions
): VersionComparison {
  const { versions: existingVersions, "dist-tags": tags } = publishedVersions;
  const { strategy, tag: publishTag } = options;
  const oldVersion = semverValid(tags?.[publishTag.value]) ?? undefined;
  const isUnique = !existingVersions?.includes(version);
  let type: ReleaseType | undefined;

  if (isUnique) {
    if (!oldVersion) {
      type = INITIAL;
    } else if (semverGreaterThan(version, oldVersion)) {
      type = semverDifference(version, oldVersion) ?? DIFFERENT;
    } else if (strategy.value === STRATEGY_ALL) {
      type = DIFFERENT;
    }
  }

  return { type, oldVersion };
}
