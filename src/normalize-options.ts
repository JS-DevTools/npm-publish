import { URL } from "url";
import { Access, Debug, Options } from "./options";

/**
 * Normalized and sanitized options
 * @internal
 */
export interface NormalizedOptions {
  token: string;
  registry: URL;
  package: string;
  tag: string;
  access?: Access;
  target: string;
  dryRun: boolean;
  checkVersion: boolean;
  greaterVersionOnly: boolean;
  quiet: boolean;
  debug: Debug;
}

/**
 * Normalizes and sanitizes options, and fills-in any default values.
 * @internal
 */
export function normalizeOptions(options: Options): NormalizedOptions {
  let registryURL =
    typeof options.registry === "string"
      ? new URL(options.registry)
      : options.registry;

  return {
    token: options.token || "",
    registry: registryURL || new URL("https://registry.npmjs.org/"),
    package: options.package || "package.json",
    tag: options.tag || "latest",
    access: options.access,
    target: options.target || "",
    dryRun: options.dryRun || false,
    checkVersion:
      options.checkVersion === undefined ? true : Boolean(options.checkVersion),
    greaterVersionOnly:
      options.greaterVersionOnly === undefined
        ? false
        : Boolean(options.greaterVersionOnly),
    quiet: options.quiet || false,
    debug: options.debug || (() => undefined),
  };
}
