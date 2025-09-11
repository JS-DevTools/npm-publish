#!/usr/bin/env node
import process from "node:process";

import { main } from "../lib/cli/index.js";
import manifest from "../package.json" with { type: "json" };

try {
  await main(process.argv.slice(2), manifest.version);
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
