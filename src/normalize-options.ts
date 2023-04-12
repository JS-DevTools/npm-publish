import path from "node:path";
import { Access, Debug, Options } from "./options";

/**
 * Normalized and sanitized options
 *
 * @internal
 */
export interface NormalizedOptions {
  token: string;
  registry: string;
  package?: string;
  tag: string;
  access?: Access;
  dryRun?: boolean;
  greaterVersionOnly?: boolean;
  quiet?: boolean;
  debug?: Debug;
}

/**
 * Normalizes and sanitizes options, and fills-in any default values.
 *
 * @internal
 */
export function normalizeOptions(options: Options): NormalizedOptions {
  return {
    ...options,
    token: options.token ?? "",
    registry: options.registry ?? "https://registry.npmjs.org/",
    tag: options.tag ?? "latest",
    package: options.package?.endsWith("package.json")
      ? path.dirname(options.package)
      : options.package,
  };
}
