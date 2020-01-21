// tslint:disable: no-console
import * as commandLineArgs from "command-line-args";
import { Options } from "..";
import { ExitCode } from "./exit-code";
import { usageText } from "./help";

/**
 * The parsed command-line arguments
 */
export interface ParsedArgs {
  help: boolean;
  version: boolean;
  quiet: boolean;
  options: Options;
}

/**
 * Parses the command-line arguments
 */
export function parseArgs(argv: string[]): ParsedArgs {
  try {
    let args = commandLineArgs(
      [
        { name: "greeting", type: String },
        { name: "subject", type: String },
        { name: "quiet", alias: "q", type: Boolean },
        { name: "version", alias: "v", type: Boolean },
        { name: "help", alias: "h", type: Boolean },
        { name: "files", type: String, multiple: true, defaultOption: true },
      ],
      { argv }
    );

    if (args.greeting === null) {
      throw new Error("The --greeting option requires a value.");
    }

    if (args.subject === null) {
      throw new Error("The --subject option requires a value.");
    }

    return {
      help: Boolean(args.help),
      version: Boolean(args.version),
      quiet: Boolean(args.quiet),
      options: {
        greeting: args.greeting as string | undefined,
        subject: args.subject as string | undefined,
      }
    };
  }
  catch (error) {
    // There was an error parsing the command-line args
    return errorHandler(error as Error);
  }
}

function errorHandler(error: Error): never {
  console.error(error.message);
  console.error(usageText);
  return process.exit(ExitCode.InvalidArgument);
}
