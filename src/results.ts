import type { Access } from "./options";
import type { ReleaseType } from "./compare-versions";

/**
 * Results of the publish
 */
export interface Results {
  /**
   * The identifier of the published package, if published.
   * Format is `${packageName}@${version}`
   */
  id: string | undefined;

  /**
   * The name of the NPM package that was published
   */
  name: string;

  /**
   * The version that was published
   */
  version: string;

  /**
   * The type of version change that occurred, if any.
   */
  releaseType: ReleaseType | undefined;

  /**
   * The version number that was previously published to NPM
   */
  previousVersion: string;

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
   * The registry where the NPM package was published
   */
  registryUrl: URL;

  /**
   * Whether this was a dry run (not published to NPM)
   */
  dryRun: boolean;
}
