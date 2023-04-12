import type { Options, Access, Strategy } from "./options";
import type { Manifest } from "./read-manifest";
import * as errors from "./errors";

const DEFAULT_REGISTRY_URL = new URL("https://registry.npmjs.org/");
const DEFAULT_TAG = "latest";
const DEFAULT_ACCESS = "public";
const DEFAULT_ACCESS_SCOPED = "restricted";
const DEFAULT_STRATEGY = "upgrade";

/**
 * Normalized and sanitized auth and publish configurations.
 */
export interface NormalizedOptions {
  authConfig: AuthConfig;
  publishConfig: PublishConfig;
}

interface ConfigValue<TValue> {
  value: TValue;
  isDefault: boolean;
}

/**
 * Normalized and sanitized auth configuration.
 */
export interface AuthConfig {
  registryUrl: ConfigValue<URL>;
  token: ConfigValue<string>;
}

/**
 * Normalized and sanitized publish configuration.
 */
export interface PublishConfig {
  packageSpec: ConfigValue<string>;
  tag: ConfigValue<string>;
  access: ConfigValue<Access>;
  dryRun: ConfigValue<boolean>;
  strategy: ConfigValue<Strategy>;
}

const setValue = <T>(
  value: T | undefined,
  defaultValue: T
): ConfigValue<T> => ({
  value: value ?? defaultValue,
  isDefault: value === undefined || value === defaultValue,
});

const setUrlValue = (
  value: URL | undefined,
  defaultValue: URL
): ConfigValue<URL> => ({
  value: value ?? defaultValue,
  isDefault: value === undefined || value?.href === defaultValue.href,
});

/**
 * Normalizes and sanitizes options, and fills-in any default values.
 */
export function normalizeOptions(
  options: Options,
  manifest: Manifest
): NormalizedOptions {
  let defaultRegistryUrl = DEFAULT_REGISTRY_URL;
  let defaultTag = DEFAULT_TAG;
  let defaultAccess: Access = manifest.scope
    ? DEFAULT_ACCESS_SCOPED
    : DEFAULT_ACCESS;

  let registryUrl;

  if (options.registryUrl !== undefined) {
    try {
      registryUrl = new URL(options.registryUrl);
    } catch {
      throw new errors.InvalidRegistryUrlError(options.registryUrl);
    }
  }

  if (options.token !== undefined && typeof options.token !== "string") {
    throw new errors.InvalidTokenError();
  }

  const authConfig: AuthConfig = {
    token: { value: options.token, isDefault: false },
    registryUrl: setUrlValue(registryUrl, defaultRegistryUrl),
  };

  const publishConfig: PublishConfig = {
    packageSpec: setValue(undefined, ""),
    tag: setValue(undefined, defaultTag),
    access: setValue(undefined, defaultAccess),
    dryRun: setValue(undefined, false),
    strategy: setValue(undefined, DEFAULT_STRATEGY),
  };

  return { authConfig, publishConfig };
}
