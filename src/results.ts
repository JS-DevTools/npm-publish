import { ReleaseType } from "semver";
import { Access } from "./options";

export { ReleaseType };

/**
 * Results of the publish
 */
export interface Results {
  /**
   * The type of version change that occurred
   */
  type: ReleaseType | "none";

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

  /**
   * The tag that the package was published to.
   */
  tag: string;

  /**
   * Indicates whether the published package is publicly visible
   * or restricted to members of your NPM organization.
   */
  access: Access;

  /**
   * Whether this was a dry run (not published to NPM)
   */
  dryRun: boolean;
}
