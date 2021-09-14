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

  // Compare both versions to see if it's changed
  let cmp = semver.compare(manifest.version, publishedVersion);

  let shouldPublish =
    !options.checkVersion ||
    // compare returns 1 if manifest is higher than published
    (options.greaterVersion && cmp === 1) ||
    // compare returns 0 if the manifest is the same as published
    cmp !== 0;

  if (shouldPublish) {
    // Publish the new version to NPM
    await npm.publish(manifest, options);
  }

  let results: Results = {
    package: manifest.name,
    type: (options.greaterVersion && cmp === -1 && "lower") || diff || "none",
    version: manifest.version.raw,
    oldVersion: publishedVersion.raw,
    tag: options.tag,
    access:
      options.access ||
      (manifest.name.startsWith("@") ? "restricted" : "public"),
    dryRun: options.dryRun,
  };

  options.debug("OUTPUT:", results);
  return results;
}
