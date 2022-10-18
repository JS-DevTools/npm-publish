/**
 * Text explaining how to use the CLI
 * @internal
 */
export const usageText = `
Usage: npm-publish [options] [package_path]

options:
  --token <token>     The NPM access token to use when publishing

  --registry <url>    The NPM registry URL to use

  --debug, -d         Enable debug mode, with increased logging

  --quiet, -q         Suppress unnecessary output

  --version, -v       Print the version number

  --help, -h          Show help

package_path          The absolute or relative path of the NPM package to publish.
                      Can be a directory path, or the path of a package.json file.
                      Defaults to the current directory.
`;
