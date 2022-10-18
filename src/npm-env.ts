import { NormalizedOptions } from "./normalize-options";

/**
 * Returns the environment variables that should be passed to NPM, based on the given options.
 */
export function getNpmEnvironment(options: NormalizedOptions): NodeJS.ProcessEnv {
  /* eslint-disable @typescript-eslint/naming-convention */
  let env: NodeJS.ProcessEnv = {
    // Copy all the host's environment variables
    ...process.env,

    // Don't pass Node.js runtime variables to NPM
    NODE_ENV: "",
    NODE_OPTIONS: "",
  };

  // Determine if we need to set the NPM token
  let needsToken = Boolean(options.token && process.env.INPUT_TOKEN !== options.token);

  if (needsToken) {
    env.INPUT_TOKEN = options.token;
  }

  return env;
}
