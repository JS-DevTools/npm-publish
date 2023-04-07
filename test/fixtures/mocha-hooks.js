"use strict";

const { promises: fs } = require("fs");
const paths = require("../utils/paths");

/**
 * Re-create the .tmp directories before each test
 */
beforeEach("create fixture directories", async () => {
  // Create the home and workspace directories
  await fs.mkdir(paths.home, { recursive: true });
  await fs.mkdir(paths.workspace, { recursive: true });
});

afterEach("clean the .tmp directory", async () => {
  // Delete the .tmp directory, if it exists
  await fs.rm(paths.tmp, { recursive: true, force: true });
});
