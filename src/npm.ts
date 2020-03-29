import * as ezSpawn from "@jsdevtools/ez-spawn";
import { ono } from "@jsdevtools/ono";
import { StdioOptions } from "child_process";
import { dirname, resolve } from "path";
import { SemVer } from "semver";
import { NormalizedOptions } from "./normalize-options";
import { setNpmConfig } from "./npm-config";
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
      // Get the environment variables to pass to NPM
      let env = getNpmEnvironment(options);

      options.debug(`Running command: npm view ${name} version`);

      // Run NPM to get the latest published versiono of the package
      let { stdout } = await ezSpawn.async("npm", ["view", name, "version"], { env });
      let version = stdout.trim();

      // Parse/validate the version number
      let semver = new SemVer(version);

      options.debug(`The local version of ${name} is at v${semver}`);
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
      // Run "npm publish" in the package.json directory
      let cwd = resolve(dirname(options.package));

      // Determine whether to suppress NPM's output
      let stdio: StdioOptions = options.quiet ? "pipe" : "inherit";

      // Get the environment variables to pass to NPM
      let env = getNpmEnvironment(options);

      options.debug("Running command: npm publish", { stdio, cwd, env });

      // Run NPM to publish the package
      await ezSpawn.async("npm", ["publish"], { cwd, stdio, env });
    }
    catch (error) {
      throw ono(error, `Unable to publish ${name} v${version} to NPM.`);
    }
  },
};


/**
 * Returns the environment variables that should be passed to NPM, based on the given options.
 */
function getNpmEnvironment(options: NormalizedOptions): NodeJS.ProcessEnv | undefined {
  // Determine if we need to set the NPM token
  let needsToken = Boolean(options.token && process.env.INPUT_TOKEN !== options.token);

  if (needsToken) {
    return { ...process.env, INPUT_TOKEN: options.token };
  }
}
