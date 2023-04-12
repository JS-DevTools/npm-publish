import * as actionsCore from "@actions/core";
import { npmPublish } from "../npm-publish";
import type { Access, Options, Strategy } from "../options";

/**
 * The main entry point of the GitHub Action
 *
 * @internal
 */
async function main(): Promise<void> {
  try {
    // Setup global error handlers
    process.on("uncaughtException", errorHandler);
    process.on("unhandledRejection", errorHandler);

    // Get the GitHub Actions input options
    const options: Options = {
      token: getInput("token", true),
      package: getInput("package"),
      registryUrl: getInput("registryUrl"),
      tag: getInput("tag"),
      access: getInput<Access>("access"),
      strategy: getInput<Strategy>("strategy"),
      dryRun: getInput("dry-run")?.toLowerCase() === "true",
    };

    // Publish to NPM
    let results = await npmPublish(options);

    if (!results.releaseType) {
      console.log(
        `\n📦 ${results.name} v${results.version} is already published to ${results.registryUrl}`
      );
    }
    if (results.releaseType === "lower") {
      console.log(
        `\n📦 ${results.name} v${results.version} is lower than the version published to ${results.registryUrl}`
      );
    } else if (results.dryRun) {
      console.log(
        `\n📦 ${results.name} v${results.version} was NOT actually published to ${results.registryUrl} (dry run)`
      );
    } else {
      console.log(
        `\n📦 Successfully published ${results.name} v${results.version} to ${results.registryUrl}`
      );
    }

    // Set the GitHub Actions output variables
    setOutput("id", results.id);
    setOutput("name", results.name);
    setOutput("version", results.version);
    setOutput("release-type", results.releaseType);
    setOutput("previous-version", results.previousVersion);
    setOutput("tag", results.tag);
    setOutput("access", results.access);
    setOutput("registry-url", results.registryUrl);
    setOutput("dry-run", results.dryRun);
  } catch (error) {
    errorHandler(error as Error);
  }
}

/**
 * Get input.
 */

function getInput<ReturnT = string, TRequired extends boolean = false>(
  name: string,
  required?: TRequired
): TRequired extends true ? ReturnT : ReturnT | undefined {
  const value = actionsCore.getInput(name, { required });
  return value === "" ? undefined : (value as any);
}

/**
 * Set output with logging to stdout for test support
 */
function setOutput(...args: Parameters<typeof actionsCore.setOutput>) {
  if (process.env.NODE_ENV === "test") {
    console.log(`TEST::set-output name=${args[0]}::${args[1]}`);
    return;
  }
  return actionsCore.setOutput(...args);
}

/**
 * Prints errors to the GitHub Actions console
 */
function errorHandler(error: Error): void {
  let message = error.stack || error.message || String(error);
  actionsCore.setFailed(message);
  process.exit();
}

/**
 * Prints debug logs to the GitHub Actions console
 */
// function debugHandler(message: string, data?: object) {
//   if (data) {
//     message += "\n" + JSON.stringify(data, undefined, 2);
//   }

//   actionsCore.debug(message);
// }

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();
