import * as semver from "semver";
import { normalizeOptions } from "./normalize-options";
import { npm } from "./npm";
import { Options } from "./options";
import { readManifest } from "./read-manifest";
import { Results } from "./results";

/**
 * Publishes a package to NPM, if its version has changed
 */
export async function npmPublish(opts: Options = {}): Promise<Results> {
  let options = normalizeOptions(opts);

  // Get the old and new version numbers
  let manifest = await readManifest(options.package, options.debug);
  let publishedVersion = await npm.getLatestVersion(manifest.name, options);

  // Determine if/how the version has changed
  let diff = semver.diff(manifest.version, publishedVersion);

  if (diff || !options.checkVersion) {
    // Publish the new version to NPM
    await npm.publish(manifest, options);
  }

  let results: Results = {
    package: manifest.name,
    type: diff || "none",
    version: manifest.version.raw,
    oldVersion: publishedVersion.raw,
    tag: options.tag,
    access: options.access || (manifest.name.startsWith("@") ? "restricted" : "public"),
    dryRun: options.dryRun
  };

  options.debug("OUTPUT:", results);
  return results;
}
