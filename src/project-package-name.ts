import { Options, Settings } from "./settings";

/**
 * This is the project description
 *
 * @returns - Options
 */
export function projectExportName(options?: Options): string {
  let settings = new Settings(options);

  if (settings.greeting === "Goodbye") {
    // Simulate a runtime error
    throw new Error("Cannot say goodbye");
  }

  return `${settings.greeting}, ${settings.subject}.`;
}
