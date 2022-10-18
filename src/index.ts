import { npmPublish } from "./npm-publish";

// Export the external type definitions as named exports
export * from "./options";
export * from "./results";

// Export `npmPublish` as a named export and the default export
export { npmPublish };
export default npmPublish;

// CommonJS default export hack
if (typeof module === "object" && typeof module.exports === "object") {
  module.exports = Object.assign(module.exports.default, module.exports);
}
