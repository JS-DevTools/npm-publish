import { getInput, setFailed, setOutput } from "@actions/core";
import { Options } from "./options";
import { publishToNPM } from "./publish-to-npm";

/**
 * The main entry point of the GitHub Action
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
    };

    // Puglish to NPM
    let results = await publishToNPM(options);

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
 * Prints errors to the console
 */
function errorHandler(error: Error): void {
  let message = error.stack || error.message || String(error);
  setFailed(message);
  process.exit();
}

// tslint:disable-next-line: no-floating-promises
main();
