import * as ezSpawn from "@jsdevtools/ez-spawn";
import { ono } from "@jsdevtools/ono";
import { promises as fs } from "fs";
import { EOL } from "os";
import { dirname } from "path";
import { NormalizedOptions } from "./normalize-options";
import { getNpmEnvironment } from "./npm-env";

/**
 * Sets/updates the NPM config based on the options.
 * @internal
 */
export async function setNpmConfig(options: NormalizedOptions): Promise<void> {
  // Read the current NPM config
  let configPath = await getNpmConfigPath(options);
  let config = await readNpmConfig(configPath, options);

  // Update the config
  config = updateConfig(config, options);

  // Save the new config
  await writeNpmConfig(configPath, config, options);
}


/**
 * Updates the given NPM config with the specified options.
 */
function updateConfig(config: string, { registry, debug }: NormalizedOptions): string {
  let authDomain = registry.origin.slice(registry.protocol.length);

  let lines = config.split(/\r?\n/);

  // Remove any existing lines that set the registry or token
  lines = lines.filter((line) =>
    !(line.startsWith("registry=") || line.includes("_authToken="))
  );

  // Append the new registry and token to the end of the file
  lines.push(`${authDomain}/:_authToken=\${INPUT_TOKEN}`);
  lines.push(`registry=${registry.href}`);

  config = lines.join(EOL).trim() + EOL;

  debug(`NEW NPM CONFIG: \n${config}`);
  return config;
}


/**
 * Gets the path of the NPM config file.
 */
async function getNpmConfigPath(options: NormalizedOptions): Promise<string> {
  try {
    // Get the environment variables to pass to NPM
    let env = getNpmEnvironment(options);

    options.debug("Running command: npm config get userconfig");

    let process = await ezSpawn.async("npm", "config", "get", "userconfig", { env });
    return process.stdout.trim();
  }
  catch (error) {
    throw ono(error, "Unable to determine the NPM config file path.");
  }
}


/**
 * Reads the NPM config file.
 */
async function readNpmConfig(configPath: string, { debug }: NormalizedOptions): Promise<string> {
  try {
    debug(`Reading NPM config from ${configPath}`);

    let config = await fs.readFile(configPath, "utf-8");

    debug(`OLD NPM CONFIG: \n${config}`);
    return config;
  }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      debug("OLD NPM CONFIG: <none>");
      return "";
    }

    throw ono(error, `Unable to read the NPM config file: ${configPath}`);
  }
}


/**
 * Writes the NPM config file.
 */
async function writeNpmConfig(configPath: string, config: string, { debug }: NormalizedOptions): Promise<void> {
  try {
    debug(`Writing new NPM config to ${configPath}`);

    await fs.mkdir(dirname(configPath), { recursive: true });
    await fs.writeFile(configPath, config);
  }
  catch (error) {
    throw ono(error, `Unable to update the NPM config file: ${configPath}`);
  }
}
