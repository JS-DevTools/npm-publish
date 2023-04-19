/** Wrapper module for command-line-args */

import minimist from "minimist";
import type { Options, Access, Strategy } from "../options.js";

export class UsageError extends TypeError {
  public constructor(message: string) {
    super(message);
    this.name = "UsageError";
  }
}

const ARGUMENTS_OPTIONS = {
  string: ["package", "token", "registry", "tag", "access", "strategy"],
  boolean: ["dry-run", "quiet", "debug", "version", "help"],
  alias: { h: "help", v: "version" },
};

const KNOWN_KEYS = new Set([
  "_",
  ...ARGUMENTS_OPTIONS.string,
  ...ARGUMENTS_OPTIONS.boolean,
  ...Object.keys(ARGUMENTS_OPTIONS.alias),
]);

/** The parsed command-line arguments */
export interface ParsedArguments {
  help?: boolean;
  version?: boolean;
  quiet?: boolean;
  debug?: boolean;
  options: Options;
}

/**
 * Parse the given command-line arguments.
 *
 * @param argv The list of argument strings passed to the program.
 * @returns A parsed object of options.
 */
export function parseCliArguments(argv: string[]): ParsedArguments {
  const parsed = minimist(argv, ARGUMENTS_OPTIONS);

  for (const option of Object.keys(parsed)) {
    if (!KNOWN_KEYS.has(option)) {
      throw new UsageError(`Unknown option: ${option}`);
    }
  }

  if (parsed._.length > 1) {
    throw new Error(`Too many positional arguments: ${parsed._.join(" ")}`);
  }

  const help = parsed["help"] as boolean;
  const version = parsed["version"] as boolean;
  const quiet = parsed["quiet"] as boolean;
  const debug = parsed["debug"] as boolean;
  const packageSpec = (parsed["package"] as string | undefined) ?? parsed._[0];
  const token = parsed["token"] as string;
  const registry = parsed["registry"] as string;
  const tag = parsed["tag"] as string;
  const access = parsed["access"] as Access;
  const strategy = parsed["strategy"] as Strategy;
  const dryRun = parsed["dry-run"] as boolean;

  return {
    help,
    version,
    quiet,
    debug,
    options: {
      package: packageSpec,
      token,
      registry,
      tag,
      access,
      strategy,
      dryRun,
    },
  };
}
