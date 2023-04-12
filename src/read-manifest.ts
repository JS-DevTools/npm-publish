import fs from "node:fs/promises";
import path from "node:path";
import { ono } from "@jsdevtools/ono";

/**
 * A package manifest (package.json)
 *
 * @internal
 */
export interface Manifest {
  name: string;
  version: string;
  scope?: string;
}

/**
 * Reads the package manifest (package.json) and returns its parsed contents.
 *
 * @param packagePath The path to the package being published.
 * @returns The parsed package metadata.
 */
export async function readManifest(packagePath?: string): Promise<Manifest> {
  let manifestPath = packagePath;

  if (!manifestPath) {
    manifestPath = "package.json";
  } else if (path.extname(manifestPath) === "") {
    manifestPath = path.join(manifestPath, "package.json");
  }

  let json: string;

  try {
    json = await fs.readFile(manifestPath, "utf8");
  } catch (error) {
    throw ono(error, `Unable to read ${manifestPath}`);
  }

  try {
    const { name, version } = JSON.parse(json) as Record<string, unknown>;

    if (typeof name !== "string" || name.trim().length === 0) {
      throw new TypeError("Invalid package name");
    }

    if (typeof version !== "string" || version.trim().length === 0) {
      throw new TypeError("Invalid package version");
    }

    return { name: name.trim(), version: version.trim() };
  } catch (error) {
    throw ono(error, `Unable to parse ${manifestPath}`);
  }
}
