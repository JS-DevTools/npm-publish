import { ReleaseType } from "semver";

/**
 * Results of the `publish
 */
export interface Results {
  /**
   * The type of version change that occurred
   */
  type: ReleaseType | "none";

  /**
   * The version that was published
   */
  version: string;

  /**
   * The version number that was previously published to NPM
   */
  oldVersion: string;
}
