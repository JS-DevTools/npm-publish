"use strict";

const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "../..");

module.exports = {
  /**
   * The path of the GitHub Action JavaScript file
   */
  action: path.join(ROOT_DIR, "dist/index.js"),

  /**
   * The path of the CLI JavaScript file
   */
  cli: path.join(ROOT_DIR, "bin/npm-publish.js"),

  /**
   * The path of our mock bin directory
   */
  bin: path.join(ROOT_DIR, "test/fixtures/bin"),

  /**
   * The path of our mock NPM binary
   */
  npm: path.join(ROOT_DIR, "test/fixtures/bin/npm"),

  /**
   * The path of the user's .npmrc file
   */
  npmrc: path.join(ROOT_DIR, "test/.tmp/home/.npmrc"),

  /**
   * The path of the config file for the mock NPM binary
   */
  mocks: path.join(ROOT_DIR, "test/.tmp/npm-mocks.json"),

  /**
   * The temp directory used for files/folders that are created during tests
   */
  tmp: path.join(ROOT_DIR, "test/.tmp"),

  /**
   * The path used as the user's home directory, where the .npmrc file is located
   */
  home: path.join(ROOT_DIR, "test/.tmp/home"),

  /**
   * The path used as the user's workspace and CWD when running the GitHub Action
   */
  workspace: path.join(ROOT_DIR, "test/.tmp/workspace"),
};
