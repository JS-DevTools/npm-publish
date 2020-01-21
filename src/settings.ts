/**
 * Options that can be provided by callers.  All fields are optional.
 */
export type Options = Partial<Settings>;

/**
 * Normalized, sanitized, and complete settings,
 * with default values for anything that wasn't specified by the caller.
 */
export class Settings {
  /**
   * The greeting to return.
   *
   * The default is `"Hello"`.
   */
  public greeting = "Hello";

  /**
   * The name of the subject to greet.
   *
   * The default is `"world"`.
   */
  public subject = "world";

  /**
   * Normalizes and sanitizes options provided by the caller,
   * and applies default values for any settings that aren't specified.
   */
  public constructor(options: Options = {}) {
    options.greeting && (this.greeting = String(options.greeting));
    options.subject && (this.subject = String(options.subject));
  }
}
