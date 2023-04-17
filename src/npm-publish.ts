import { readManifest } from "./read-manifest.js";
import { normalizeOptions } from "./normalize-options.js";
import { getVersions, publish } from "./npm/index.js";
import { compareVersions } from "./compare-versions.js";
import { formatPublishResult } from "./format-publish-result.js";
import type { Options } from "./options.js";
import type { Results } from "./results.js";

/**
 * Publishes a package to NPM, if its version has changed.
 *
 * @param options Publish options.
 * @returns Release metadata.
 */
export async function npmPublish(options: Options): Promise<Results> {
  const { packageSpec, manifest } = await readManifest(options.package);
  const { authConfig, publishConfig } = normalizeOptions(options, manifest);
  const publishedVersions = await getVersions(manifest.name, authConfig);
  const versionComparison = compareVersions(
    manifest.version,
    publishedVersions,
    publishConfig
  );

  let publishResult;

  if (versionComparison.type !== undefined) {
    publishResult = await publish(packageSpec, publishConfig, authConfig);
  }

  options.logger?.info(
    formatPublishResult(manifest, publishConfig, publishResult)
  );

  return {
    id: publishResult?.id,
    name: manifest.name,
    version: manifest.version,
    type: versionComparison.type,
    oldVersion: versionComparison.oldVersion,
    registry: authConfig.registry.value,
    tag: publishConfig.tag.value,
    access: publishConfig.access.value,
    strategy: publishConfig.strategy.value,
    dryRun: publishConfig.dryRun.value,
  };
}
