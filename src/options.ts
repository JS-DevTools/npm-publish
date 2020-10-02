import { URL } from "url";

/**
 * Options that determine how/whether the package is published.
 */
export interface Options {
  /**
   * The NPM access token to use when publishing
   */
  token?: string;

  /**
   * The NPM registry URL to use.
   *
   * Defaults to "https://registry.npmjs.org/"
   */
  registry?: string | URL;

  /**
   * The absolute or relative path of your package.json file.
   *
   * Defaults to "./package.json"
   */
  package?: string;

  /**
   * The tag to publish to. This allows people to install the package
   * using "npm install <package-name>@<tag>".
   *
   * Defaults to "latest"
   */
  tag?: string;

  /**
   * Determines whether the published package should be publicly visible,
   * or restricted to members of your NPM organization. This only applies
   * to scoped packages.
   *
   * Defaults to "restricted" for scoped packages and "public" for non-scoped packages.
   */
  access?: Access;

  /**
   * If true, run npm publish with the --dry-run flag
   * so that the package is not published. Used for
   * testing workflows.
   *
   * Defaults to `false`
   */
  dryRun?: boolean;

  /**
   * Only publish the package if the version number in package.json
   * differs from the latest on NPM.
   *
   * Defaults to `true`
   */
  checkVersion?: boolean;

  /**
   * Suppress console output from NPM and npm-publish.
   *
   * Defaults to `false`
   */
  quiet?: boolean;

  /**
   * A function to call to log debug messages.
   *
   * Defaults to a no-op function
   */
  debug?: Debug;
}

/**
 * The possible access levels for an NPM package
 */
export type Access = "public" | "restricted";

/**
 * A function that receives debug messages
 */
export type Debug = (message: string, data?: object) => void;
