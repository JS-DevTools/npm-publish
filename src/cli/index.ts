import { join } from "path";
import { npmPublish } from "../npm-publish";
import { readManifest } from "../read-manifest";
import { ExitCode } from "./exit-code";
import { usageText } from "./help";
import { parseArgs } from "./parse-args";

/**
 * The main entry point of the CLI
 *
 * @param args - The command-line arguments
 */
export async function main(args: string[]): Promise<void> {
  try {
    // Setup global error handlers
    process.on("uncaughtException", errorHandler);
    process.on("unhandledRejection", errorHandler);

    // Parse the command-line arguments
    let { help, version, options } = parseArgs(args);

    if (help) {
      // Show the help text and exit
      console.log(usageText);
      process.exit(ExitCode.Success);
    } else if (version) {
      // Show the version number and exit
      let manifest = await readManifest(join(__dirname, "../../package.json"));
      console.log(manifest.version.toString());
      process.exit(ExitCode.Success);
    } else {
      let results = await npmPublish(options);

      // if (!options.quiet) {
      if (!results.releaseType) {
        console.log(
          `\n📦 ${results.name} v${results.version} is already published to ${results.registryUrl}`
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
      // }
    }
  } catch (error) {
    errorHandler(error as Error);
  }
}

/**
 * Prints errors to the console
 */
function errorHandler(error: Error): void {
  let message = error.message || String(error);

  if (process.env.DEBUG || process.env.NODE_ENV === "development") {
    message = error.stack || message;
  }

  console.error(message);
  process.exit(ExitCode.FatalError);
}
