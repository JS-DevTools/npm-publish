import * as ezSpawn from "ez-spawn";
import { ono } from "ono";
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
  async getLatestVersion(name: string, { debug }: NormalizedOptions): Promise<SemVer> {
    try {
      debug(`Running command: npm view ${name} version`);

      // Run NPM to get the latest published versiono of the package
      let process = await ezSpawn.async("npm", "view", name, "version");
      let version = process.stdout.trim();

      // Parse/validate the version number
      let semver = new SemVer(version);

      debug(`The local version of ${name} is at v${semver}`);
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
      options.debug(`Running command: npm publish`);

      // Run NPM to publish the package
      await ezSpawn.async("npm", ["publish"], {
        stdio: "inherit",
        cwd: resolve(dirname(options.package)),
      });
    }
    catch (error) {
      throw ono(error, `Unable to publish ${name} v${version} to NPM.`);
    }
  },
};
