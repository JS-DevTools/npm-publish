import { ono } from "@jsdevtools/ono";
import { promises as fs } from "fs";
import { resolve } from "path";
import { SemVer } from "semver";
import { Debug } from "./options";

/**
 * A package manifest (package.json)
 * @internal
 */
export interface Manifest {
  name: string;
  version: SemVer;
}

/**
 * Reads the package manifest (package.json) and returns its parsed contents
 * @internal
 */
export async function readManifest(path: string, debug?: Debug): Promise<Manifest> {
  debug && debug(`Reading package manifest from ${resolve(path)}`);
  let json: string;

  try {
    json = await fs.readFile(path, "utf-8");
  }
  catch (error) {
    throw ono(error, `Unable to read ${path}`);
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
  }
  catch (error) {
    throw ono(error, `Unable to parse ${path}`);
  }
}
