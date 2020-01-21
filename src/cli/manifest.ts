// NOTE: We can't `import` the package.json file because it's outside of the "src" directory.
// tslint:disable-next-line: no-var-requires no-require-imports
export const manifest = require("../../package.json") as Manifest;

/**
 * The npm package manifest (package.json)
 */
export interface Manifest {
  name: string;
  version: string;
  description: string;
  bin: {
    [bin: string]: string;
  };
  [key: string]: unknown;
}
