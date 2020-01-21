import { promises as fs } from "fs";
import { ono } from "ono";
import { SemVer } from "semver";

/**
 * A package manifest (package.json)
 */
export interface Manifest {
  name: string;
  version: SemVer;
}

/**
 * Reads the package manifest (package.json) and returns its parsed contents
 */
export async function readManifest(path: string): Promise<Manifest> {
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
      throw new TypeError(`Invalid package name`);
    }

    return {
      name,
      version: new SemVer(version as string),
    };
  }
  catch (error) {
    throw ono(error, `Unable to parse ${path}`);
  }
}
