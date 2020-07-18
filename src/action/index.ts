import { debug, getInput, setFailed, setOutput } from "@actions/core";
import { npmPublish } from "../npm-publish";
import { Options } from "../options";

/**
 * The main entry point of the GitHub Action
 * @internal
 */
async function main(): Promise<void> {
  try {
    // Setup global error handlers
    process.on("uncaughtException", errorHandler);
    process.on("unhandledRejection", errorHandler);

    // Get the GitHub Actions input options
    const options: Options = {
      token: getInput("token", { required: true }),
      registry: getInput("registry", { required: true }),
      package: getInput("package", { required: true }),
      checkVersion: getInput("check-version", { required: true }).toLowerCase() === "true",
      debug: debugHandler,
    };

    // Puglish to NPM
    let results = await npmPublish(options);

    if (results.type === "none") {
      console.log(`\n📦 ${results.package} v${results.version} is already published to NPM`);
    }
    else {
      console.log(`\n📦 Successfully published ${results.package} v${results.version} to NPM`);
    }

    // Set the GitHub Actions output variables
    setOutput("type", results.type);
    setOutput("version", results.version);
    setOutput("old-version", results.oldVersion);
  }
  catch (error) {
    errorHandler(error as Error);
  }
}

/**
 * Prints errors to the GitHub Actions console
 */
function errorHandler(error: Error): void {
  let message = error.stack || error.message || String(error);
  setFailed(message);
  process.exit();
}

/**
 * Prints debug logs to the GitHub Actions console
 */
function debugHandler(message: string, data?: object) {
  if (data) {
    message += "\n" + JSON.stringify(data, undefined, 2);
  }

  debug(message);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();
