"use strict";

const fs = require("fs");
const path = require("path");
const paths = require("../utils/paths");

// Ensure that the mock NPM binary is executable
fs.chmodSync(paths.npm, "0777");

// Inject our bin directory path into the PATH variable,
// so that npm-publish runs our mock `npm` binaries instead of the real one.
let otherPaths = getEnvPath();
process.env.PATH = paths.bin + path.delimiter + otherPaths; // eslint-disable-line no-path-concat


/**
 * Returns the PATH environment variable, case-insensitively
 */
function getEnvPath () {
  let keys = Object.keys(process.env);

  for (let key of keys) {
    if (key.toUpperCase() === "PATH") {
      return process.env[key];
    }
  }
}
