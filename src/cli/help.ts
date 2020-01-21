import { manifest } from "./manifest";

const cli = Object.keys(manifest.bin)[0];

/**
 * Text explaining how to use the CLI
 */
export const usageText = `
Usage: ${cli} [options] [files...]

options:
  -v, --version             Show the version number

  -q, --quiet               Suppress unnecessary output

  -h, --help                Show usage information

files...
  One or more files and/or globs to process (ex: README.md *.txt docs/**/*).
`;

/**
 * Text describing the program and how to use it
 */
export const helpText = `
${manifest.name} - ${manifest.description}
${usageText}`;
