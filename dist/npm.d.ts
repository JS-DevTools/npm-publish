import { SemVer } from "semver";
import { Options } from "./options";
import { Manifest } from "./read-manifest";
/**
 * Runs NPM commands.
 */
export declare const npm: {
    /**
     * Gets the latest published version of the specified package.
     */
    getLatestVersion(name: string): Promise<SemVer>;
    /**
     * Publishes the specified package to NPM
     */
    publish({ name, version }: Manifest, options: Options): Promise<void>;
};
