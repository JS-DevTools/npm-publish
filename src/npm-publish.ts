import { readManifest } from "./read-manifest";
import { normalizeOptions } from "./normalize-options";
import { getVersions, publish } from "./npm";
import { compareVersions } from "./compare-versions";
import type { Options } from "./options";
import type { Results } from "./results";

/**
 * Publishes a package to NPM, if its version has changed
 */
export async function npmPublish(options: Options): Promise<Results> {
  const manifest = await readManifest(options.package);
  const { authConfig, publishConfig } = normalizeOptions(options, manifest);
  const publishedVersions = await getVersions(manifest.name, authConfig);
  const versionComparison = compareVersions(publishedVersions, publishConfig);
  let publishResult;

  if (versionComparison.releaseType !== undefined) {
    publishResult = await publish(publishConfig, authConfig);
  }

  return {
    id: publishResult?.id,
    name: manifest.name,
    version: manifest.version,
    releaseType: versionComparison.releaseType,
    previousVersion: versionComparison.previousVersion,
    tag: publishConfig.tag.value,
    access: publishConfig.access.value,
    dryRun: publishConfig.dryRun.value,
    registryUrl: authConfig.registryUrl.value,
  };
}
