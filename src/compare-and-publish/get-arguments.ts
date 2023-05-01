import type { NormalizedOptions } from "../normalize-options.js";

/**
 * Given a package name and publish configuration, get the NPM CLI view
 * arguments.
 *
 * @param packageName Package name.
 * @param options Publish configuration.
 * @param retryWithTag Include a non-latest tag in the package spec for a rety
 *   attempt.
 * @returns Arguments to pass to the NPM CLI. If `retryWithTag` is true, but the
 *   publish config is using the `latest` tag, will return `undefined`.
 */
export function getViewArguments(
  packageName: string,
  options: NormalizedOptions,
  retryWithTag = false
): string[] {
  const packageSpec = retryWithTag
    ? `${packageName}@${options.tag.value}`
    : packageName;

  return [packageSpec, "dist-tags", "versions"];
}

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
  const { tag, access, dryRun, provenance } = options;
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

  if (!provenance.isDefault && provenance.value) {
    publishArguments.push("--provenance");
  }

  if (!dryRun.isDefault && dryRun.value) {
    publishArguments.push("--dry-run");
  }

  return publishArguments;
}
