import fs from "node:fs/promises";
import path from "node:path";
import { valid as semverValid } from "semver";

import * as errors from "./errors.js";

/** The result of reading a package manifest */
export interface ManifestReadResult {
  packageSpec: string;
  manifest: PackageManifest;
}

/** A package manifest (package.json) */
export interface PackageManifest {
  name: string;
  version: string;
  scope: string | undefined;
  publishConfig: PackagePublishConfig | undefined;
}

/** Any publish configuration defined in package.json. */
export interface PackagePublishConfig {
  tag?: string;
  access?: string;
  registry?: string;
}

const SCOPE_RE = /^(@.+)\/.+$/u;

const MANIFEST_BASENAME = "package.json";

const isManifest = (name: unknown): name is string => {
  return typeof name === "string" && path.basename(name) === MANIFEST_BASENAME;
};

const isDirectory = (name: unknown): name is string => {
  return typeof name === "string" && path.extname(name) === "";
};

const isVersion = (version: unknown): version is string => {
  return semverValid(version as string) !== null;
};

/**
 * Reads the package manifest (package.json) and returns its parsed contents.
 *
 * @param packagePath The path to the package being published.
 * @returns The parsed package metadata.
 */
export async function readManifest(
  packagePath: unknown
): Promise<ManifestReadResult> {
  let packageSpec: string | undefined;
  let manifestPath: string;

  if (!packagePath) {
    packageSpec = "";
    manifestPath = path.resolve(MANIFEST_BASENAME);
  } else if (isManifest(packagePath)) {
    packageSpec = path.resolve(path.dirname(packagePath));
    manifestPath = path.resolve(packagePath);
  } else if (isDirectory(packagePath)) {
    packageSpec = path.resolve(packagePath);
    manifestPath = path.resolve(packagePath, MANIFEST_BASENAME);
  } else {
    throw new errors.InvalidPackageError(packagePath);
  }

  let manifestContents: string;
  let manifestJson: Record<string, unknown>;
  let name: unknown;
  let version: unknown;
  let publishConfig: unknown;

  try {
    manifestContents = await fs.readFile(manifestPath, "utf8");
  } catch (error) {
    throw new errors.PackageJsonReadError(manifestPath, error);
  }

  try {
    manifestJson = JSON.parse(manifestContents) as Record<string, unknown>;
    name = manifestJson["name"];
    version = manifestJson["version"];
    publishConfig = manifestJson["publishConfig"] ?? {};
  } catch (error) {
    throw new errors.PackageJsonParseError(manifestPath, error);
  }

  if (typeof name !== "string" || name.length === 0) {
    throw new errors.InvalidPackageNameError(name);
  }

  if (!isVersion(version)) {
    throw new errors.InvalidPackageVersionError(version);
  }

  if (
    typeof publishConfig !== "object" ||
    Array.isArray(publishConfig) ||
    !publishConfig
  ) {
    throw new errors.InvalidPackagePublishConfigError(publishConfig);
  }

  return {
    packageSpec,
    manifest: { name, version, publishConfig, scope: SCOPE_RE.exec(name)?.[1] },
  };
}
