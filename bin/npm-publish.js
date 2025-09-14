#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import url from "node:url";

import { main } from "../lib/cli/index.js";

const dirname = path.dirname(url.fileURLToPath(import.meta.url));

/** @type {{ version: string }} */
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const { version } = JSON.parse(
  fs.readFileSync(path.join(dirname, "../package.json"), "utf8")
);

try {
  await main(process.argv.slice(2), version);
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
