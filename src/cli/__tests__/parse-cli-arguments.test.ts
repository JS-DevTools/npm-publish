import { describe, it, expect } from "vitest";

import * as subject from "../parse-cli-arguments.js";

describe("parseCliArguments", () => {
  it("should parse help and version options", () => {
    expect(subject.parseCliArguments(["--help"])).toMatchObject({ help: true });
    expect(subject.parseCliArguments(["-h"])).toMatchObject({ help: true });
    expect(subject.parseCliArguments(["--version"])).toMatchObject({
      version: true,
    });
    expect(subject.parseCliArguments(["-v"])).toMatchObject({ version: true });
  });

  it("should parse token and package arguments", () => {
    expect(
      subject.parseCliArguments(["--token", "abc123", "--package", "./package"])
    ).toEqual({
      help: false,
      version: false,
      quiet: false,
      debug: false,
      options: {
        token: "abc123",
        package: "./package",
        registry: undefined,
        tag: undefined,
        access: undefined,
        provenance: undefined,
        strategy: undefined,
        ignoreScripts: undefined,
        dryRun: undefined,
      },
    });

    expect(
      subject.parseCliArguments(["--token", "abc123", "./package"])
    ).toEqual({
      help: false,
      version: false,
      quiet: false,
      debug: false,
      options: {
        token: "abc123",
        package: "./package",
        registry: undefined,
        tag: undefined,
        access: undefined,
        strategy: undefined,
        ignoreScripts: undefined,
        dryRun: undefined,
      },
    });
  });

  it("should parse other options", () => {
    expect(
      subject.parseCliArguments(
        [
          ["--token", "abc123"],
          ["--package", "./package"],
          ["--registry", "http://example.com"],
          ["--tag", "next"],
          ["--access", "restricted"],
          ["--strategy", "upgrade"],
          ["--provenance"],
          ["--no-ignore-scripts"],
          ["--dry-run"],
          ["--quiet"],
          ["--debug"],
        ].flat()
      )
    ).toEqual({
      help: false,
      version: false,
      quiet: true,
      debug: true,
      options: {
        token: "abc123",
        package: "./package",
        registry: "http://example.com",
        tag: "next",
        access: "restricted",
        provenance: true,
        strategy: "upgrade",
        ignoreScripts: false,
        dryRun: true,
      },
    });
  });

  it("should reject unknown options", () => {
    expect(() => subject.parseCliArguments(["--foobar"])).toThrow(
      /Unknown option/
    );
  });
});
