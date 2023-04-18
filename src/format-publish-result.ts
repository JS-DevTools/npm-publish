import os from "node:os";

import type { PublishResult } from "./npm/index.js";
import type { PackageManifest } from "./read-manifest.js";
import type { NormalizedOptions } from "./normalize-options.js";

/**
 * Format publish results into a string.
 *
 * @param manifest Package manifest
 * @param options Configuration options.
 * @param results Results from running npm publish.
 * @returns Formatted string.
 */
export function formatPublishResult(
  manifest: PackageManifest,
  options: NormalizedOptions,
  results?: PublishResult
): string {
  if (results === undefined) {
    return `🙅‍♀️ ${manifest.name}@${manifest.version} publish skipped.`;
  }

  return [
    `📦 ${results.id}${options.dryRun.value ? " (DRY RUN)" : ""}`,
    "=== Contents ===",
    ...results.files.map(({ path, size }) => `${formatSize(size)}\t${path}`),
  ].join(os.EOL);
}

const formatSize = (size: number): string => {
  if (size < 1000) {
    return `${size} B`;
  }
  if (size < 1_000_000) {
    return `${(size / 1000).toFixed(1)} kB`;
  }

  return `${(size / 1_000_000).toFixed(1)} MB`;
};
