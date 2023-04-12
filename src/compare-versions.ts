import type { ReleaseType as SemverReleaseType } from "semver";

import type { PublishConfig } from "./normalize-options";
import type { VersionsResult } from "./npm";

export type ReleaseType = SemverReleaseType | "lower";

export interface VersionComparison {
  releaseType: ReleaseType | undefined;
  previousVersion: string;
}

export function compareVersions(
  versions: VersionsResult,
  publishConfig: PublishConfig
): VersionComparison {
  void versions;
  void publishConfig;

  throw new Error("ah");
}
