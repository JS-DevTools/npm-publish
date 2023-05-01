// import type { NormalizedOptions } from "../normalize-options.js";
// import { useNpmEnvironment } from "./use-npm-environment.js";
// import { callNpmCli } from "./call-npm-cli.js";
// import { getViewArguments, getPublishArguments } from "./get-arguments.js";

export * from "./call-npm-cli.js";
export * from "./use-npm-environment.js";

// /**
//  * Get a package's published versions.
//  *
//  * @param packageName The name of the package to get published versions for.
//  * @param options Configuration options.
//  * @returns All published versions and tags. May return an empty object if
//  *   package exists but has no `latest` tag.
//  */
// export async function getVersions(
//   packageName: string,
//   options: NormalizedOptions
// ): Promise<PublishedVersions> {
//   const viewArguments = getViewArguments(packageName, options);
//   const viewRetryArguments = getViewArguments(packageName, options, true);

//   return useNpmEnvironment(options, (environment) => {
//     return callNpmCli<PublishedVersions>("view", viewArguments, {
//       logger: options.logger,
//       environment,
//       ifError: { e404: { "dist-tags": {}, versions: [] } },
//       retryIfEmpty: viewRetryArguments,
//     });
//   });
// }

// /**
//  * Publish a package.
//  *
//  * @param packageSpec Package specification to pass to npm.
//  * @param options Configuration options.
//  * @returns Release metadata.
//  */
// export async function publish(
//   packageSpec: string,
//   options: NormalizedOptions
// ): Promise<PublishResult> {
//   const publishArguments = getPublishArguments(packageSpec, options);

//   return useNpmEnvironment(options, (environment) => {
//     return callNpmCli<PublishResult>("publish", publishArguments, {
//       logger: options.logger,
//       environment,
//     });
//   });
// }
