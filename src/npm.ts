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

    try {
      let command = ["npm", "view"];

      if (options.tag === "latest") {
        command.push(name);
      }
      else {
        command.push(`${name}@${options.tag}`);
      }

      command.push("version");

      // Get the environment variables to pass to NPM
      let env = getNpmEnvironment(options);

      // Run NPM to get the latest published version of the package
      options.debug(`Running command: npm view ${name} version`, { command, env });
      let result;

      try {
        result = await ezSpawn.async(command, { env });
      }
      catch (err) {
        // In case ezSpawn.async throws, it still has stdout and stderr properties.
        result = err as ezSpawn.ProcessError;
      }

      let version = result.stdout.trim();
      let error = result.stderr.trim();
      let status = result.status || 0;

      // If the package was not previously published, return version 0.0.0.
      if ((status === 0 && !version) || error.includes("E404")) {
        options.debug(`The latest version of ${name} is at v0.0.0, as it was never published.`);
        return new SemVer("0.0.0");
      }
      else if (result instanceof Error) {
        // NPM failed for some reason
        throw result;
      }

      // Parse/validate the version number
      let semver = new SemVer(version);

      options.debug(`The latest version of ${name} is at v${semver}`);
      return semver;
    }
    catch (error) {
      throw ono(error, `Unable to determine the current version of ${name} on NPM.`);
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
