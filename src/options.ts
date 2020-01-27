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
 * A function that receives debug messages
 */
export type Debug = (message: string, data?: object) => void;
