/** Wrapper module for @actions/core */
import {
  getInput as ghGetInput,
  setOutput as ghSetOutput,
  setSecret as ghSetSecret,
  setFailed as ghSetFailed,
  debug as ghLogDebug,
  info as ghLogInfo,
  error as ghLogError,
} from "@actions/core";

import type { Logger } from "../options.js";

/** Logger using the methods from @actions/core. */
export const logger: Logger = {
  debug: ghLogDebug,
  info: ghLogInfo,
  error: ghLogError,
};

/**
 * Get input by name.
 *
 * @param name Input name
 * @returns The input string value, or undefined if not set
 */
export function getInput<T extends string>(name: string): T | undefined {
  const inputString = ghGetInput(name);
  return inputString.length > 0 ? (inputString as T) : undefined;
}

/**
 * Get a required secret input by name.
 *
 * @param name Input name
 * @returns The input secret value.
 */
export function getRequiredSecretInput(name: string): string {
  const inputString = ghGetInput(name, { required: true });
  ghSetSecret(inputString);
  return inputString;
}

/**
 * Get a boolean input by name.
 *
 * @param name Input name
 * @returns True if value is "true", false if "false", undefined if unset
 */
export function getBooleanInput(name: string): boolean | undefined {
  const inputString = ghGetInput(name).toLowerCase();

  if (inputString === "true") return true;
  if (inputString === "false") return false;
  return undefined;
}

/**
 * Set the action as failed due to an error.
 *
 * @param error An value from a `catch`
 */
export function setFailed(error: unknown) {
  ghSetFailed(error as Error);
}

/**
 * Set an output by name.
 *
 * @param name Output name
 * @param value Output value
 */
export function setOutput(name: string, value: string | boolean): void;

/**
 * Set an output by name.
 *
 * @param name Output name
 * @param value Output value
 * @param defaultValue Default value if value is undefined.
 */
export function setOutput(
  name: string,
  value: string | boolean | undefined,
  defaultValue: string | boolean
): void;

// eslint-disable-next-line jsdoc/require-jsdoc
export function setOutput(
  name: string,
  value: string | boolean | undefined,
  defaultValue?: string | boolean | undefined
): void {
  ghSetOutput(name, value ?? defaultValue);
}
