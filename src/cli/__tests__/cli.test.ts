import { vi, describe, beforeEach, afterEach, it } from "vitest";
import { imitateEsm, reset } from "testdouble-vitest";
import * as td from "testdouble";

import { npmPublish, type Options } from "../../index.js";
import * as subject from "../index.js";
import { parseCliArguments } from "../parse-cli-arguments.js";

vi.mock("../../index", () => imitateEsm("../../index"));
vi.mock("../parse-cli-arguments", () => imitateEsm("../parse-cli-arguments"));

describe("cli", () => {
  beforeEach(() => {
    vi.stubGlobal("console", td.object());
  });

  afterEach(() => {
    reset();
    vi.unstubAllGlobals();
  });

  it("should parse arguments and pass them to npmPublish", async () => {
    td.when(parseCliArguments(["--token", "abc123"])).thenReturn({
      help: false,
      version: false,
      quiet: false,
      debug: false,
      options: { token: "abc123" },
    });

    await subject.main(["--token", "abc123"], "1.2.3");

    td.verify(
      npmPublish({
        token: "abc123",
        logger: td.matchers.contains({
          error: console.error,
          info: console.info,
          debug: td.matchers.not(console.debug),
        }),
      }),
      { times: 1 }
    );
  });

  it("should log the version", async () => {
    td.when(parseCliArguments(["--version"])).thenReturn({
      help: false,
      version: true,
      options: {} as Options,
    });

    await subject.main(["--version"], "1.2.3");

    td.verify(console.info("1.2.3"), { times: 1 });
  });

  it("should log usage", async () => {
    td.when(parseCliArguments(["--help"])).thenReturn({
      help: true,
      version: false,
      options: {} as Options,
    });

    await subject.main(["--help"], "1.2.3");

    td.verify(console.info(td.matchers.contains("Usage:")), { times: 1 });
  });

  it("should have quiet mode and debug mode", async () => {
    td.when(parseCliArguments(["--token", "abc123"])).thenReturn({
      help: false,
      version: false,
      quiet: true,
      debug: true,
      options: { token: "abc123" },
    });

    await subject.main(["--token", "abc123"], "1.2.3");

    td.verify(
      npmPublish({
        token: "abc123",
        logger: td.matchers.contains({
          error: console.error,
          info: td.matchers.not(console.info),
          debug: console.debug,
        }),
      }),
      { times: 1 }
    );
  });
});
