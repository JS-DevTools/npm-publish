import os from "node:os";

import type { PublishResult } from "./compare-and-publish/index.js";
import type { PackageManifest } from "./read-manifest.js";
import type { NormalizedOptions } from "./normalize-options.js";

const DRY_RUN_BANNER =
  "=== DRY RUN === DRY RUN === DRY RUN === DRY RUN === DRY RUN ===";

const CONTENTS_BANNER = "=== Contents ===";

/**
 * Format publish results into a string.
 *
 * @param manifest Package manifest
 * @param options Configuration options.
 * @param result Results from running npm publish.
 * @returns Formatted string.
 */
export function formatPublishResult(
  manifest: PackageManifest,
  options: NormalizedOptions,
  result: PublishResult
): string {
  const lines = [];

  lines.push(
    result.id === undefined
      ? `🙅‍♀️ ${manifest.name}@${manifest.version} already published.`
      : `📦 ${result.id}`
  );

  if (result.files.length > 0) {
    lines.push("", CONTENTS_BANNER);
  }

  for (const { path, size } of result.files) {
    lines.push(`${formatSize(size)}\t${path}`);
  }

  return (
    options.dryRun.value
      ? [DRY_RUN_BANNER, "", ...lines, "", DRY_RUN_BANNER]
      : lines
  ).join(os.EOL);
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
