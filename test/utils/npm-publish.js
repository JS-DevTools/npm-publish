"use strict";

const chai = require("chai");
const chaiExec = require("chai-exec");
const paths = require("./paths");

module.exports = runNpmPublish;

chai.use(chaiExec);

chaiExec.defaults = {
  command: "node",
  args: [
    paths.action
  ],
  options: {
    cwd: paths.workspace,
    env: {
      ...process.env,
      INPUT_REGISTRY: "https://registry.npmjs.org/",
      INPUT_PACKAGE: "package.json",
      "INPUT_CHECK-VERSION": "true",
    },
  },
};


/**
 * Runs the npm-publish GitHub Action
 */
function runNpmPublish (options) {
  // Deep merge the options object, since Chai Exec only does a shallow merge
  options = {
    ...chaiExec.defaults.options,
    ...options,
    env: {
      ...chaiExec.defaults.options.env,
      ...options.env,
    }
  };

  return chaiExec(options);
}
