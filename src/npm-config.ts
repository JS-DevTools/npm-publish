import * as ezSpawn from "ez-spawn";
import { promises as fs } from "fs";
import { ono } from "ono";
import { EOL } from "os";
import { dirname } from "path";
import { Options } from "./options";

/**
 * Sets/updates the NPM config based on the options.
 */
export async function setNpmConfig(options: Options): Promise<void> {
  // Read the current NPM config
  let configPath = await getNpmConfigPath();
  let config = await readNpmConfig(configPath);

  // Update the config
  config = updateConfig(config, options);

  // Save the new config
  await writeNpmConfig(configPath, config);
}


/**
 * Updates the given NPM config with the specified options.
 */
function updateConfig(config: string, { registry, token }: Options): string {
  let lines = config.split(/\r?\n/);

  // Remove any existing lines that set the registry or token
  lines = lines.filter((line) =>
    !(line.startsWith("registry=") || line.includes("_authToken="))
  );

  // Append the new registry and token to the end of the file
  lines.push(`registry=${registry}`);
  lines.push(`${registry}:_authToken=\${INPUT_TOKEN}`);

  return lines.join(EOL).trim() + EOL;
}


/**
 * Gets the path of the NPM config file.
 */
async function getNpmConfigPath(): Promise<string> {
  try {
    let process = await ezSpawn.async("npm", "config", "get", "userconfig");
    return process.stdout.trim();
  }
  catch (error) {
    throw ono(error, `Unable to determine the NPM config file path.`);
  }
}


/**
 * Reads the NPM config file.
 */
async function readNpmConfig(configPath: string): Promise<string> {
  try {
    let config = await fs.readFile(configPath, "utf-8");
    return config;
  }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return "";
    }

    throw ono(error, `Unable to read the NPM config file: ${configPath}`);
  }
}


/**
 * Writes the NPM config file.
 */
async function writeNpmConfig(configPath: string, config: string): Promise<void> {
  try {
    await fs.mkdir(dirname(configPath), { recursive: true });
    await fs.writeFile(configPath, config);
  }
  catch (error) {
    throw ono(error, `Unable to update the NPM config file: ${configPath}`);
  }
}
