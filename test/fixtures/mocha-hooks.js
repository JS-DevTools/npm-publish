"use strict";

const { promises: fs } = require("fs");
const paths = require("../utils/paths");

process.env.NODE_ENV = "test";

/**
 * Re-create the .tmp directories before each test
 */
beforeEach("clean the .tmp directory", async () => {
  // Delete the .tmp directory, if it exists
  try {
    await fs.rm(paths.tmp, { recursive: true });
  }
  catch (err) {
    if (err.code === "ENOENT") return;
    throw err;
  }

  // Create the home and workspace directories
  await fs.mkdir(paths.home, { recursive: true });
  await fs.mkdir(paths.workspace, { recursive: true });
});
