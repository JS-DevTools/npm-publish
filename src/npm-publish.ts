import * as semver from "semver";
import { normalizeOptions } from "./normalize-options";
import { getVersions, publish } from "./npm";
import { Options } from "./options";
import { readManifest } from "./read-manifest";
import { Results } from "./results";

/**
 * Publishes a package to NPM, if its version has changed
 */
export async function npmPublish(opts: Options = {}): Promise<Results> {
  const { registry, token, ...options } = normalizeOptions(opts);
  const authOptions = { registry, token };

  // Get the old and new version numbers
  const manifest = await readManifest(options.package, options.debug);
  const versions = await getVersions(manifest.name, authOptions);
  const publishedVersion = versions["dist-tags"][options.tag] ?? "0.0.0";

  // Determine if/how the version has changed
  let diff = semver.diff(manifest.version, publishedVersion);

  // Compare both versions to see if it's changed
  let cmp = semver.compare(manifest.version, publishedVersion);

  let shouldPublish =
    // compare returns 1 if manifest is higher than published
    (options.greaterVersionOnly && cmp === 1) ||
    // compare returns 0 if the manifest is the same as published
    cmp !== 0;

  if (shouldPublish) {
    // Publish the new version to NPM
    await publish(options, authOptions);
  }

  let results: Results = {
    package: manifest.name,
    registry: authOptions.registry,
    // The version should be marked as lower if we disallow decrementing the version
    type:
      (options.greaterVersionOnly && cmp === -1 && "lower") || diff || "none",
    version: manifest.version.raw,
    oldVersion: publishedVersion,
    tag: options.tag,
    access:
      options.access ||
      (manifest.name.startsWith("@") ? "restricted" : "public"),
    dryRun: options.dryRun ?? false,
  };

  options.debug?.("OUTPUT:", results);
  return results;
}
