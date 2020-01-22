import { debug } from "@actions/core";
import * as ezSpawn from "ez-spawn";
import { ono } from "ono";
import { dirname, resolve } from "path";
import { SemVer } from "semver";
import { setNpmConfig } from "./npm-config";
import { Options } from "./options";
import { Manifest } from "./read-manifest";

/**
 * Runs NPM commands.
 */
export const npm = {
  /**
   * Gets the latest published version of the specified package.
   */
  async getLatestVersion(name: string): Promise<SemVer> {
    try {
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
  async publish({ name, version }: Manifest, options: Options): Promise<void> {
    // Update the NPM config with the specified registry and token
    await setNpmConfig(options);

    try {
      // Run NPM to publish the package
      await ezSpawn.async("npm", ["publish"], {
        stdio: "inherit",
        cwd: resolve(dirname(options.package)),
        env: {
          ...process.env,
          NPM_TOKEN: options.token,
        }
      });

      debug(`Successfully published ${name} v${version} to NPM`);
    }
    catch (error) {
      throw ono(error, `Unable to publish ${name} v${version} to NPM.`);
    }
  },
};
