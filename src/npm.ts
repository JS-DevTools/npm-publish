import * as ezSpawn from "@jsdevtools/ez-spawn";
import { ono } from "@jsdevtools/ono";
import { StdioOptions } from "child_process";
import { dirname, resolve } from "path";
import { SemVer } from "semver";
import { NormalizedOptions } from "./normalize-options";
import { setNpmConfig } from "./npm-config";
import { getNpmEnvironment } from "./npm-env";
import { Manifest } from "./read-manifest";

/**
 * Runs NPM commands.
 * @internal
 */
export const npm = {
  /**
   * Gets the latest published version of the specified package.
   */
  async getLatestVersion(name: string, options: NormalizedOptions): Promise<SemVer> {
    // Update the NPM config with the specified registry and token
    await setNpmConfig(options);

    let taggedName = options.tag === "latest" ? name : `${name}@${options.tag}`;

    try {
      let command = ["npm", "view", taggedName, "version"];

      // Get the environment variables to pass to NPM
      let env = getNpmEnvironment(options);

      // Run NPM to get the latest published version of the package
      options.debug(`Running command: ${command.join(" ")}`, { command, env });
      let { stdout, stderr } = await ezSpawn.async(command, { env });
      let version = stdout.trim();

      // If the package was not previously published, return version 0.0.0.
      if (stderr && stderr.includes("E404") || !version) {
        options.debug(`The latest version of ${taggedName} is at v0.0.0, as it was never published.`);
        return new SemVer("0.0.0");
      }

      // Parse/validate the version number
      let semver = new SemVer(version);

      options.debug(`The latest version of ${taggedName} is at v${semver}`);
      return semver;
    }
    catch (error) {
      throw ono(error, `Unable to determine the current version of ${taggedName} on NPM.`);
    }
  },


  /**
   * Publishes the specified package to NPM
   */
  async publish({ name, version }: Manifest, options: NormalizedOptions): Promise<void> {
    // Update the NPM config with the specified registry and token
    await setNpmConfig(options);

    try {
      let command = ["npm", "publish"];

      if (options.tag !== "latest") {
        command.push("--tag", options.tag);
      }

      if (options.access) {
        command.push("--access", options.access);
      }

      if (options.dryRun) {
        command.push("--dry-run");
      }

      // Run "npm publish" in the package.json directory
      let cwd = resolve(dirname(options.package));

      // Determine whether to suppress NPM's output
      let stdio: StdioOptions = options.quiet ? "pipe" : "inherit";

      // Get the environment variables to pass to NPM
      let env = getNpmEnvironment(options);

      // Run NPM to publish the package
      options.debug("Running command: npm publish", { command, stdio, cwd, env });
      await ezSpawn.async(command, { cwd, stdio, env });
    }
    catch (error) {
      throw ono(error, `Unable to publish ${name} v${version} to NPM.`);
    }
  },
};
