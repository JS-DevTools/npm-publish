import type { PublishConfig } from "../normalize-options";

/**
 * Given a publish configuration, get the NPM CLI publish arguments.
 *
 * @param config Publish configuration
 * @returns Arguments to pass to the NPM CLI
 */
export function getPublishArgs(config: PublishConfig): string[] {
  const { packageSpec, tag, access, dryRun } = config;

  return [
    packageSpec.value,
    "--tag",
    tag.value,
    "--access",
    access.value,
    "--dry-run",
    JSON.stringify(dryRun.value),
  ];
}
