import type { NpmClientOptions } from ".";
import type { NpmCliOptions } from "./call-npm-cli";

export async function configureNpmCli(
  options: NpmClientOptions
): Promise<NpmCliOptions> {
  throw new Error("configureNpmCli not implemented");
}

export async function removeNpmCliConfig(
  cliOptions: NpmCliOptions
): Promise<void> {
  throw new Error("removeNpmCliConfig not implemented");
}
