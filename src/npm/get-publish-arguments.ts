import type { PublishConfig } from "../normalize-options.js";

/**
 * Given a publish configuration, get the NPM CLI publish arguments.
 *
 * @param packageSpec Package specification path
 * @param config Publish configuration
 * @returns Arguments to pass to the NPM CLI
 */
export function getPublishArguments(
  packageSpec: string,
  config: PublishConfig
): string[] {
  const { tag, access, dryRun } = config;
  const publishArguments = [];

  if (packageSpec.length > 0) {
    publishArguments.push(packageSpec);
  }

  if (!tag.isDefault) {
    publishArguments.push("--tag", tag.value);
  }

  if (!access.isDefault && access.value) {
    publishArguments.push("--access", access.value);
  }

  if (!dryRun.isDefault) {
    publishArguments.push("--dry-run", JSON.stringify(dryRun.value));
  }

  return publishArguments;
}
