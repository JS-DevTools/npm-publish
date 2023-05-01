import { readManifest } from "./read-manifest.js";
import { normalizeOptions } from "./normalize-options.js";
import { useNpmEnvironment } from "./npm/index.js";
import { compareAndPublish } from "./compare-and-publish/index.js";
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
  const manifest = await readManifest(options.package);
  const normalizedOptions = normalizeOptions(manifest, options);
  const publishResult = await useNpmEnvironment(
    manifest,
    normalizedOptions,
    compareAndPublish
  );

  normalizedOptions.logger?.info?.(
    formatPublishResult(manifest, normalizedOptions, publishResult)
  );

  return {
    id: publishResult.id,
    type: publishResult.type,
    oldVersion: publishResult.oldVersion,
    name: manifest.name,
    version: manifest.version,
    registry: normalizedOptions.registry,
    tag: normalizedOptions.tag.value,
    access: normalizedOptions.access.value,
    strategy: normalizedOptions.strategy.value,
    dryRun: normalizedOptions.dryRun.value,
  };
}
