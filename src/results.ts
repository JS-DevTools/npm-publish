import { ReleaseType } from "semver";

export { ReleaseType };

/**
 * Results of the `publish
 */
export interface Results {
  /**
   * The type of version change that occurred
   */
  type: ReleaseType | "none" | "dry-run";

  /**
   * The name of the NPM package that was published
   */
  package: string;

  /**
   * The version that was published
   */
  version: string;

  /**
   * The version number that was previously published to NPM
   */
  oldVersion: string;
}
