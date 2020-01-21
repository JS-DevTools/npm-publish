import { SemVer } from "semver";
/**
 * A package manifest (package.json)
 */
export interface Manifest {
    name: string;
    version: SemVer;
}
/**
 * Reads the package manifest (package.json) and returns its parsed contents
 */
export declare function readManifest(path: string): Promise<Manifest>;
