import fs from "node:fs/promises";
import path from "node:path";
import { valid as semverValid } from "semver";
import { list as tarList, type ReadEntry } from "tar";

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
const TARBALL_EXTNAME = ".tgz";

const isManifest = (file: unknown): file is string => {
  return typeof file === "string" && path.basename(file) === MANIFEST_BASENAME;
};

const isDirectory = (file: unknown): file is string => {
  return typeof file === "string" && path.extname(file) === "";
};

const isTarball = (file: unknown): file is string => {
  return typeof file === "string" && path.extname(file) === TARBALL_EXTNAME;
};

const isVersion = (version: unknown): version is string => {
  return semverValid(version as string) !== null;
};

const readPackageJson = async (...pathSegments: string[]): Promise<string> => {
  const file = path.resolve(...pathSegments);

  try {
    return await fs.readFile(file, "utf8");
  } catch (error) {
    throw new errors.PackageJsonReadError(file, error);
  }
};

const readTarballPackageJson = async (file: string): Promise<string> => {
  const data: Buffer[] = [];
  const onentry = (entry: ReadEntry) => {
    if (entry.path === "package/package.json") {
      entry.on("data", (chunk) => data.push(chunk));
    }
  };

  try {
    await tarList({ file, onentry });

    if (data.length === 0) {
      throw new Error("package.json not found inside archive");
    }
  } catch (error) {
    throw new errors.PackageTarballReadError(file, error);
  }

  return Buffer.concat(data).toString();
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
  let manifestContents: string;

  if (!packagePath) {
    packageSpec = "";
    manifestContents = await readPackageJson(MANIFEST_BASENAME);
  } else if (isManifest(packagePath)) {
    packageSpec = path.resolve(path.dirname(packagePath));
    manifestContents = await readPackageJson(packagePath);
  } else if (isDirectory(packagePath)) {
    packageSpec = path.resolve(packagePath);
    manifestContents = await readPackageJson(packagePath, MANIFEST_BASENAME);
  } else if (isTarball(packagePath)) {
    packageSpec = path.resolve(packagePath);
    manifestContents = await readTarballPackageJson(packageSpec);
  } else {
    throw new errors.InvalidPackageError(packagePath);
  }

  let manifestJson: Record<string, unknown>;
  let name: unknown;
  let version: unknown;
  let publishConfig: unknown;

  try {
    manifestJson = JSON.parse(manifestContents) as Record<string, unknown>;
    name = manifestJson["name"];
    version = manifestJson["version"];
    publishConfig = manifestJson["publishConfig"] ?? {};
  } catch (error) {
    throw new errors.PackageJsonParseError(packageSpec, error);
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
