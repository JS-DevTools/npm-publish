import type { PublishConfig } from ".";

/**
 * Given a publish configuration, get the NPM CLI publish arguments.
 *
 * @param config Publish configuration
 * @returns Arguments to pass to the NPM CLI
 */
export function getPublishArgs(config: PublishConfig): string[] {
  const { packageSpec, tag, access, dryRun } = config;
  const args: string[] = [];

  if (packageSpec !== undefined) {
    args.push(packageSpec);
  }

  if (tag !== undefined) {
    args.push("--tag", tag);
  }

  if (access !== undefined) {
    args.push("--access", access);
  }

  if (dryRun !== undefined) {
    args.push("--dry-run", JSON.stringify(dryRun));
  }

  return args;
}
