#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/use-unknown-in-catch-callback-variable, unicorn/prefer-module, unicorn/prefer-top-level-await */
"use strict";

const process = require("node:process");
const { version } = require("../package.json");
const { main } = require("../lib/cli/index.js");

main(process.argv.slice(2), version).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
