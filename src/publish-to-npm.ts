import { debug } from "@actions/core";
import * as semver from "semver";
import { npm } from "./npm";
import { Options } from "./options";
import { readManifest } from "./read-manifest";
import { Results } from "./results";

/**
 * Publishes an package to NPM, if its version has changed
 */
export async function publishToNPM(options: Options): Promise<Results> {
  // Get the old and new version numbers
  let manifest = await readManifest(options.package);
  let publishedVersion = await npm.getLatestVersion(manifest.name);

  // Determine if/how the version has changed
  let diff = semver.diff(manifest.version, publishedVersion);

  if (diff || !options.checkVersion) {
    // Publish the new version to NPM
    await npm.publish(manifest, options);
  }
  else {
    debug(`${name} v${publishedVersion} is already published to NPM`);
  }

  return {
    type: diff || "none",
    version: manifest.version.raw,
    oldVersion: publishedVersion.raw,
  };
}
