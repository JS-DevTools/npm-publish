import commandLineArgs from "command-line-args";
import { Access, Options } from "../options.js";
import { ExitCode } from "./exit-code.js";
import { usageText } from "./help.js";

/**
 * The parsed command-line arguments
 *
 * @internal
 */
export interface ParsedArgs {
  help?: boolean;
  version?: boolean;
  options: Options;
}

/**
 * Parses the command-line arguments
 *
 * @internal
 */
export function parseArgs(argv: string[]): ParsedArgs {
  try {
    let args = commandLineArgs(
      [
        { name: "token", type: String },
        {
          name: "registry",
          type: String,
          defaultValue: "https://registry.npmjs.org/",
        },
        { name: "package", type: String, defaultOption: true },
        { name: "tag", type: String },
        { name: "access", type: String },
        { name: "dry-run", type: Boolean },
        { name: "debug", alias: "d", type: Boolean },
        { name: "quiet", alias: "q", type: Boolean },
        { name: "version", alias: "v", type: Boolean },
        { name: "help", alias: "h", type: Boolean },
      ],
      { argv }
    );

    if (args.token === null) {
      throw new SyntaxError("The --token argument requires a value");
    }

    if (args.registry === null) {
      throw new SyntaxError("The --registry argument requires a value");
    }

    let parsedArgs: ParsedArgs = {
      help: args.help as boolean,
      version: args.version as boolean,
      options: {
        token: args.token as string,
        registryUrl: args.registry as string,
        package: args.package as string,
        tag: args.tag as string,
        access: args.access as Access,
        dryRun: args["dry-run"] as boolean,
      },
    };

    return parsedArgs;
  } catch (error) {
    // There was an error parsing the command-line args
    return errorHandler(error as Error);
  }
}

function errorHandler(error: Error): never {
  console.error(error.message);
  console.error(usageText);
  return process.exit(ExitCode.InvalidArgument);
}
