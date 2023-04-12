export class NpmPublishError extends Error {
  public originalError: Error | undefined;

  public constructor(message: string, originalError?: Error) {
    if (originalError) {
      super(`${message}\n${originalError.message}`);
    } else {
      super(message);
    }

    this.name = "NpmPublishError";
    this.originalError = originalError;
  }
}

export class InvalidRegistryUrlError extends TypeError {
  public constructor(value: unknown) {
    super(`The given value "${String(value)}" is not a valid registry URL`);
    this.name = "InvalidRegistryUrlError";
  }
}

export class InvalidTokenError extends TypeError {
  public constructor() {
    super("The given value [omitted for security] is not a valid token");
    this.name = "InvalidTokenError";
  }
}
