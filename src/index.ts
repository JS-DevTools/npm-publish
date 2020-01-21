import { projectExportName } from "./project-package-name";

export { Options } from "./settings";
export { projectExportName };

// Export `projectExportName` as the default export
// tslint:disable: no-default-export
export default projectExportName;

// CommonJS default export hack
if (typeof module === "object" && typeof module.exports === "object") {
  module.exports = Object.assign(module.exports.default, module.exports);  // tslint:disable-line: no-unsafe-any
}
