/**
 * The possible access levels for an NPM package
 */
export type Access = "public" | "restricted";

/**
 * Version check strategy.
 *
 * - `upgrade`: the package will only be published if its version
 *   is higher than the existing version on the configured tag.
 * - `always`: the package will be published if its version
 *   is not yet published, even if its lower that the existing tag.
 */
export type Strategy = "upgrade" | "always";

/**
 * A function that logs messages
 */
export type HandleLog = (message: string, data?: object) => void;

/**
 * A level at which a log can occur.
 */
export type LogLevel = "error" | "warn" | "info" | "debug";

/**
 * An object that can be used to log messages.
 */
export type Logger = Record<LogLevel, HandleLog>;

/**
 * Options that determine how/whether the package is published.
 */
export interface Options {
  /**
   * The NPM access token to use when publishing.
   */
  token: string;

  /**
   * The absolute or relative path of your package.
   *
   * Defaults to the package in the current working directory.
   */
  package?: string;

  /**
   * The NPM registry URL to use.
   *
   * Defaults to "https://registry.npmjs.org/".
   *
   * Can be overridden by the package.json's `publishConfig` field.
   */
  registryUrl?: string | URL;

  /**
   * The tag to publish to.
   *
   * Defaults to "latest".
   *
   * Can be overridden by the package.json's `publishConfig` field.
   */
  tag?: string;

  /**
   * Package access.
   *
   * Determines whether the published package should be publicly visible,
   * or restricted to members of your NPM organization. This only applies
   * to scoped packages.
   *
   * Defaults to "restricted" for scoped packages, unless that package has been
   * previously published as `public`
   *
   * Can be overridden by the package.json's `publishConfig` field.
   */
  access?: Access;

  /**
   * Version check strategy.
   *
   * If "upgrade" (default), the package will only be published if its version
   * is higher than the existing version on the configured tag. If "always",
   * the package will be published if its version is simply not yet published.
   *
   * Defaults to `upgrade`.
   */
  strategy?: Strategy;

  /**
   * Pretend to publish, but don't actually upload to the registry.
   *
   * Defaults to `false`.
   */
  dryRun?: boolean;

  /**
   * An interface to log messages.
   */
  logger?: Logger;
}
