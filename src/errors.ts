import os from "node:os";

import {
  ACCESS_PUBLIC,
  ACCESS_RESTRICTED,
  STRATEGY_ALL,
  STRATEGY_UPGRADE,
} from "./options.js";

export class InvalidPackageError extends TypeError {
  public constructor(value: unknown) {
    super(
      `Package must be a directory, package.json, or .tgz file, got "${String(
        value
      )}"`
    );
    this.name = "PackageJsonReadError";
  }
}

export class PackageJsonReadError extends Error {
  public constructor(manifestPath: string, originalError: unknown) {
    const message = [
      `Could not read package.json at ${manifestPath}`,
      originalError instanceof Error ? originalError.message : "",
    ]
      .filter(Boolean)
      .join(os.EOL);

    super(message);
    this.name = "PackageJsonReadError";
  }
}

export class PackageTarballReadError extends Error {
  public constructor(tarballPath: string, originalError: unknown) {
    const message = [
      `Could not read package.json from ${tarballPath}`,
      originalError instanceof Error ? originalError.message : "",
    ]
      .filter(Boolean)
      .join(os.EOL);

    super(message);
    this.name = "PackageTarballReadError";
  }
}

export class PackageJsonParseError extends SyntaxError {
  public constructor(packageSpec: string, originalError: unknown) {
    const message = [
      `Invalid JSON, could not parse package.json for ${packageSpec}`,
      originalError instanceof Error ? originalError.message : "",
    ]
      .filter(Boolean)
      .join(os.EOL);

    super(message);
    this.name = "PackageJsonParseError";
  }
}

export class InvalidPackageNameError extends TypeError {
  public constructor(value: unknown) {
    super(`Package name is not valid, got "${String(value)}"`);
    this.name = "InvalidPackageNameError";
  }
}

export class InvalidPackageVersionError extends TypeError {
  public constructor(value: unknown) {
    super(
      `Package version must be a valid semantic version, got "${String(value)}"`
    );
    this.name = "InvalidPackageVersionError";
  }
}

export class InvalidPackagePublishConfigError extends TypeError {
  public constructor(value: unknown) {
    super(`Publish config must be an object, got "${String(value)}"`);
    this.name = "InvalidPackagePublishConfigError";
  }
}

export class InvalidRegistryUrlError extends TypeError {
  public constructor(value: unknown) {
    super(`Registry URL invalid, got "${String(value)}"`);
    this.name = "InvalidRegistryUrlError";
  }
}

export class InvalidTokenError extends TypeError {
  public constructor() {
    super("Token must be a non-empty string.");
    this.name = "InvalidTokenError";
  }
}

export class InvalidTagError extends TypeError {
  public constructor(value: unknown) {
    super(`Tag must be a non-empty string, got "${String(value)}".`);
    this.name = "InvalidTagError";
  }
}

export class InvalidAccessError extends TypeError {
  public constructor(value: unknown) {
    super(
      `Access must be "${ACCESS_PUBLIC}" or "${ACCESS_RESTRICTED}", got "${String(
        value
      )}".`
    );
    this.name = "InvalidAccessError";
  }
}

export class InvalidStrategyError extends TypeError {
  public constructor(value: unknown) {
    super(
      `Strategy must be "${STRATEGY_UPGRADE}" or "${STRATEGY_ALL}", got "${String(
        value
      )}".`
    );
    this.name = "InvalidStrategyError";
  }
}

export class NpmCallError extends Error {
  public constructor(command: string, exitCode: number, stderr: string) {
    super(
      [
        `Call to "npm ${command}" exited with non-zero exit code ${exitCode}`,
        stderr,
      ].join(os.EOL)
    );
    this.name = "NpmCallError";
  }
}
