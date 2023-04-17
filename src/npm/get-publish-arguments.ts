import type { NormalizedOptions } from "../normalize-options.js";

/**
 * Given a publish configuration, get the NPM CLI publish arguments.
 *
 * @param packageSpec Package specification path.
 * @param options Publish configuration.
 * @returns Arguments to pass to the NPM CLI.
 */
export function getPublishArguments(
  packageSpec: string,
  options: NormalizedOptions
): string[] {
  const { tag, access, dryRun } = options;
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
