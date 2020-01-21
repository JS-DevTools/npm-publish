"use strict";

const chai = require("chai");
const chaiExec = require("chai-exec");

// Add the Chai-Exec plugin for testing the CLI
chai.use(chaiExec);

// Setup Chai Exec to run our CLI by default,
// so we don't have to specify it for every test.
chaiExec.defaults = {
  command: "node",
  args: "bin/project-cli-name.js",
};

module.exports = chaiExec;
