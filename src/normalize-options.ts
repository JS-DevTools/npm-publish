import os from "node:os";

import * as errors from "./errors.js";
import type { PackageManifest } from "./read-manifest.js";
import {
  ACCESS_PUBLIC,
  ACCESS_RESTRICTED,
  STRATEGY_UPGRADE,
  STRATEGY_ALL,
  type Access,
  type Strategy,
  type Options,
  type Logger,
} from "./options.js";

const DEFAULT_REGISTRY = "https://registry.npmjs.org/";
const DEFAULT_TAG = "latest";

/** Normalized and sanitized auth, publish, and runtime configurations. */
export interface NormalizedOptions {
  registry: URL;
  token: string;
  tag: ConfigValue<string>;
  access: ConfigValue<Access | undefined>;
  dryRun: ConfigValue<boolean>;
  strategy: ConfigValue<Strategy>;
  logger: Logger | undefined;
  temporaryDirectory: string;
}

/** A config value, and whether that value differs from default. */
export interface ConfigValue<TValue> {
  value: TValue;
  isDefault: boolean;
}

/**
 * Normalizes and sanitizes options, and fills-in any default values.
 *
 * @param options User-input options.
 * @param manifest Package metadata from package.json.
 * @returns Validated auth and publish configuration.
 */
export function normalizeOptions(
  options: Options,
  manifest: PackageManifest
): NormalizedOptions {
  const defaultTag = manifest.publishConfig?.tag ?? DEFAULT_TAG;

  const defaultRegistry = manifest.publishConfig?.registry ?? DEFAULT_REGISTRY;

  const defaultAccess =
    manifest.publishConfig?.access ??
    (manifest.scope === undefined ? ACCESS_PUBLIC : undefined);

  return {
    token: validateToken(options.token),
    registry: validateRegistry(options.registry ?? defaultRegistry),
    tag: setValue(options.tag, defaultTag, validateTag),
    access: setValue(options.access, defaultAccess, validateAccess),
    dryRun: setValue(options.dryRun, false, validateDryRun),
    strategy: setValue(options.strategy, STRATEGY_ALL, validateStrategy),
    logger: options.logger,
    temporaryDirectory: options.temporaryDirectory ?? os.tmpdir(),
  };
}

const setValue = <TValue>(
  value: unknown,
  defaultValue: unknown,
  validate: (value: unknown) => TValue
): ConfigValue<TValue> => ({
  value: validate(value ?? defaultValue),
  isDefault: value === undefined,
});

const validateToken = (value: unknown): string => {
  if (typeof value === "string" && value.length > 0) {
    return value;
  }

  throw new errors.InvalidTokenError();
};

const validateRegistry = (value: unknown): URL => {
  try {
    return new URL(value as string | URL);
  } catch {
    throw new errors.InvalidRegistryUrlError(value);
  }
};

const validateTag = (value: unknown): string => {
  return value as string;
};

const validateDryRun = (value: unknown): boolean => {
  return value as boolean;
};

const validateAccess = (value: unknown): Access | undefined => {
  if (
    value === undefined ||
    value === ACCESS_PUBLIC ||
    value === ACCESS_RESTRICTED
  ) {
    return value;
  }

  throw new errors.InvalidAccessError(value);
};

const validateStrategy = (value: unknown): Strategy => {
  if (value === STRATEGY_ALL || value === STRATEGY_UPGRADE) {
    return value;
  }

  throw new errors.InvalidStrategyError(value);
};
