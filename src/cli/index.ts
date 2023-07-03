import { npmPublish, type Logger } from "../index.js";
import { parseCliArguments } from "./parse-cli-arguments.js";

export const USAGE = `
Usage:

  npm-publish <options> [package]

Arguments:

  package                 The path to the package to publish.
                          May be a directory, package.json, or .tgz file.
                          Defaults to the package in the current directory.

Options:

  --token <token>         (Required) npm authentication token.

  --registry <url>        Registry to read from and write to.
                          Defaults to "https://registry.npmjs.org/".

  --tag <tag>             The distribution tag to check against and publish to.
                          Defaults to "latest".

  --access <access>       Package access, may be "public" or "restricted".
                          See npm documentation for details.

  --provenance            Publish with provenance statements.
                          See npm documentation for details.

  --strategy <strategy>   Publish strategy, may be "all" or "upgrade".
                          Defaults to "all", see documentation for details.

  --no-ignore-scripts     Allow lifecycle scripts, which are disabled by default
                          as a security precaution. Defaults to false.

  --dry-run               Do not actually publish anything.
  --quiet                 Only print errors.
  --debug                 Print debug logs.

  -v, --version           Print the version number.
  -h, --help              Show usage text.

Examples:

  $ npm-publish --token abc123 ./my-package
`;

/**
 * The main entry point of the CLI
 *
 * @param argv - The list of argument strings passed to the program.
 * @param version - The version of this program.
 */
export async function main(argv: string[], version: string): Promise<void> {
  const cliArguments = parseCliArguments(argv);

  if (cliArguments.help) {
    console.info(USAGE);
    return;
  }

  if (cliArguments.version) {
    console.info(version);
    return;
  }

  const logger: Logger = {
    error: console.error,
    info: cliArguments.quiet === false ? console.info : undefined,
    debug: cliArguments.debug === true ? console.debug : undefined,
  };

  await npmPublish({ ...cliArguments.options, logger });
}
