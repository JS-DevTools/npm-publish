import { Options } from "./options";
import { Results } from "./results";
/**
 * Publishes an package to NPM, if its version has changed
 */
export declare function publishToNPM(options: Options): Promise<Results>;
