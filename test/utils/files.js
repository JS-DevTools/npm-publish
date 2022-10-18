"use strict";

const fs = require("fs");
const path = require("path");
const paths = require("./paths");
const { expect } = require("chai");

module.exports = {
  /**
   * Creates files in the temp directory
   *
   * @param entries {object[]}
   * An array of files to create. Each file is an object with the following properties:
   *  - `path`: The relative path of the entry.
   *  - `contents`: The contents of the file, as a string or JSON object
   */
  create (files = []) {
    for (let file of files) {
      file = typeof file === "string" ? { path: file } : file;
      file.path = path.join(paths.tmp, file.path);

      if (typeof file.contents !== "string") {
        file.contents = JSON.stringify(file.contents);
      }

      fs.mkdirSync(path.dirname(file.path), { recursive: true });
      fs.writeFileSync(file.path, file.contents);
    }
  },

  assert: {
    /**
     * Asserts the the specified file has the specified contents
     */
    contents (p, expected) {
      let actual = fs.readFileSync(path.join(paths.tmp, p), "utf8");
      expect(actual).to.equal(expected, `Incorrect file contents in ${p}`);
    },

    /**
     * Asserts the the specified file does not exist
     */
    doesNotExist (p) {
      let exists = fs.existsSync(path.join(paths.tmp, p));
      expect(exists).to.equal(false, `File should not exist: ${p}`);
    },
  },
};
