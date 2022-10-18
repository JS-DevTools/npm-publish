"use strict";

const chai = require("chai");
const chaiExec = require("@jsdevtools/chai-exec");
const paths = require("./paths");

chai.use(chaiExec);

module.exports = {
  /**
   * Executes the GitHub Action with the specified options
   */
  action (options) {
    // Deep merge the options object, since Chai Exec only does a shallow merge
    options = {
      cwd: paths.workspace,
      ...options,
      env: {
        ...process.env,
        NODE_OPTIONS: "",
        INPUT_REGISTRY: "https://registry.npmjs.org/",
        INPUT_PACKAGE: "package.json",
        "INPUT_CHECK-VERSION": "true",
        ...options.env,
      }
    };

    return chaiExec("node", [paths.action], options);
  },

  /**
   * Executes the CLI with the specified arguments
   */
  cli (...args) {
    return chaiExec("node", [paths.cli].concat(args), { cwd: paths.workspace });
  },
};
