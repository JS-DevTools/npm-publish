#!/usr/bin/env node
/* eslint-disable unicorn/prefer-module, unicorn/prefer-top-level-await */
"use strict";

const process = require("node:process");
const { version } = require("../package.json");
const { main } = require("../lib/cli/index.js");

main(process.argv.slice(2), version).catch((error) => {
  console.log(error);
  process.exitCode = 1;
});
