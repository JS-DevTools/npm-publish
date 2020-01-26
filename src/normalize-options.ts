import { URL } from "url";
import { Debug, Options } from "./options";

/**
 * Normalized and sanitized options
 * @internal
 */
export interface NormalizedOptions {
  token: string;
  registry: URL;
  package: string;
  checkVersion: boolean;
  quiet: boolean;
  debug: Debug;
}

/**
 * Normalizes and sanitizes options, and fills-in any default values.
 * @internal
 */
export function normalizeOptions(options: Options): NormalizedOptions {
  let registryURL = typeof options.registry === "string" ? new URL(options.registry) : options.registry;

  return {
    token: options.token || "",
    registry: registryURL || new URL("https://registry.npmjs.org/"),
    package: options.package || "./package.json",
    checkVersion: options.checkVersion === undefined ? true : Boolean(options.checkVersion),
    quiet: options.quiet || false,
    debug: options.debug || (() => undefined),
  };
}
