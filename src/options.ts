/**
 * Options that determine how/whether the package is published.
 */
export interface Options {
  /**
   * The NPM access token to use when publishing
   */
  token: string;

  /**
   * The NPM registry URL to use.
   */
  registry: string;

  /**
   * The absolute or relative path of your package.json file.
   */
  package: string;

  /**
   * If set to `true`, then the package will only be published if the version number
   * in package.json differs from the latest on NPM.
   */
  checkVersion: boolean;
}
