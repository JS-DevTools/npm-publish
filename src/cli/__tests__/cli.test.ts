import { vi, describe, beforeEach, it, expect } from "vitest";
import { when } from "vitest-when";

import { npmPublish, type Options } from "../../index.js";
import * as subject from "../index.js";
import { parseCliArguments } from "../parse-cli-arguments.js";

vi.mock("../../index");
vi.mock("../parse-cli-arguments");

describe("cli", () => {
  const console = {
    info: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
  };

  beforeEach(() => {
    vi.stubGlobal("console", console);
  });

  it("should parse arguments and pass them to npmPublish", async () => {
    when(parseCliArguments)
      .calledWith(["--token", "abc123"])
      .thenReturn({
        help: false,
        version: false,
        quiet: false,
        debug: false,
        options: { token: "abc123" },
      });

    await subject.main(["--token", "abc123"], "1.2.3");

    expect(npmPublish).toHaveBeenCalledWith({
      token: "abc123",
      logger: {
        error: console.error,
        info: console.info,
        debug: undefined,
      },
    });
  });

  it("should log the version", async () => {
    when(parseCliArguments)
      .calledWith(["--version"])
      .thenReturn({
        help: false,
        version: true,
        options: {} as Options,
      });

    await subject.main(["--version"], "1.2.3");

    expect(console.info).toHaveBeenCalledWith("1.2.3");
  });

  it("should log usage", async () => {
    when(parseCliArguments)
      .calledWith(["--help"])
      .thenReturn({
        help: true,
        version: false,
        options: {} as Options,
      });

    await subject.main(["--help"], "1.2.3");

    expect(console.info).toHaveBeenCalledWith(
      expect.stringContaining("Usage:")
    );
  });

  it("should have quiet mode and debug mode", async () => {
    when(parseCliArguments)
      .calledWith(["--token", "abc123"])
      .thenReturn({
        help: false,
        version: false,
        quiet: true,
        debug: true,
        options: { token: "abc123" },
      });

    await subject.main(["--token", "abc123"], "1.2.3");

    expect(npmPublish).toHaveBeenCalledWith({
      token: "abc123",
      logger: {
        error: console.error,
        info: undefined,
        debug: console.debug,
      },
    });
  });
});
