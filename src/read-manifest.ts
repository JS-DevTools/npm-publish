import fs from "node:fs/promises";
import path from "node:path";
import { SemVer } from "semver";
import { ono } from "@jsdevtools/ono";
import { Debug } from "./options";

/**
 * A package manifest (package.json)
 *
 * @internal
 */
export interface Manifest {
  name: string;
  version: SemVer;
}

/**
 * Reads the package manifest (package.json) and returns its parsed contents
 *
 * @internal
 */
export async function readManifest(
  packageSpec?: string,
  debug?: Debug
): Promise<Manifest> {
  const packageManifest = path.join(packageSpec ?? ".", "package.json");
  debug && debug(`Reading manifest from ${path.resolve(packageManifest)}`);
  let json: string;

  try {
    json = await fs.readFile(packageManifest, "utf8");
  } catch (error) {
    throw ono(error, `Unable to read ${packageManifest}`);
  }

  try {
    let { name, version } = JSON.parse(json) as Record<string, unknown>;

    if (typeof name !== "string" || name.trim().length === 0) {
      throw new TypeError("Invalid package name");
    }

    let manifest: Manifest = {
      name,
      version: new SemVer(version as string),
    };

    debug && debug("MANIFEST:", manifest);
    return manifest;
  } catch (error) {
    throw ono(error, `Unable to parse ${packageManifest}`);
  }
}
