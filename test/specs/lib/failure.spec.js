"use strict";

const npmPublish = require("../../../");
const npm = require("../../utils/npm");
const files = require("../../utils/files");
const paths = require("../../utils/paths");
const { expect, assert } = require("chai");
const { EOL } = require("os");

describe("NPM package - failure tests", () => {
  let previousCWD;

  beforeEach(() => {
    previousCWD = process.cwd();
    process.chdir(paths.workspace);
  });

  afterEach(() => {
    process.chdir(previousCWD);
  });

  it("should fail if the NPM registry URL is invalid", async () => {
    files.create([
      { path: "workspace/package.json", contents: { name: "my-lib", version: "1.2.3" }},
    ]);

    try {
      await npmPublish({ registry: "example.com" });
      assert.fail("An error should have been thrown!");
    }
    catch (error) {
      expect(error).to.be.an.instanceOf(TypeError);
      expect(error.message).to.equal("Invalid URL: example.com");
    }

    files.assert.doesNotExist("home/.npmrc");
    npm.assert.ran(0);
  });

  it("should fail if the package.json file does not exist", async () => {
    try {
      await npmPublish();
      assert.fail("An error should have been thrown!");
    }
    catch (error) {
      expect(error).to.be.an.instanceOf(Error);
      expect(error.message).to.include("Unable to read package.json \nENOENT: no such file or directory");
    }

    files.assert.doesNotExist("home/.npmrc");
    files.assert.doesNotExist("workspace/package.json");
    npm.assert.didNotRun();
  });

  it("should fail if the package.json file is invalid", async () => {
    files.create([
      { path: "workspace/package.json", contents: "hello, world" },
    ]);

    try {
      await npmPublish();
      assert.fail("An error should have been thrown!");
    }
    catch (error) {
      expect(error).to.be.an.instanceOf(SyntaxError);
      expect(error.message).to.equal("Unable to parse package.json \nUnexpected token h in JSON at position 0");
    }

    files.assert.doesNotExist("home/.npmrc");
    npm.assert.didNotRun();
  });

  it("should fail if the package name is invalid", async () => {
    files.create([
      { path: "workspace/package.json", contents: { name: "\n  \t" }},
    ]);

    try {
      await npmPublish();
      assert.fail("An error should have been thrown!");
    }
    catch (error) {
      expect(error).to.be.an.instanceOf(TypeError);
      expect(error.message).to.equal("Unable to parse package.json \nInvalid package name");
    }

    files.assert.doesNotExist("home/.npmrc");
    npm.assert.didNotRun();
  });

  it("should fail if the package version is invalid", async () => {
    files.create([
      { path: "workspace/package.json", contents: { name: "my-lib", version: "hello, world" }},
    ]);

    try {
      await npmPublish();
      assert.fail("An error should have been thrown!");
    }
    catch (error) {
      expect(error).to.be.an.instanceOf(TypeError);
      expect(error.message).to.equal("Unable to parse package.json \nInvalid Version: hello, world");
    }

    files.assert.doesNotExist("home/.npmrc");
    npm.assert.didNotRun();
  });

  it('should fail if the "npm view" command errors', async () => {
    files.create([
      { path: "workspace/package.json", contents: { name: "my-lib", version: "2.0.0" }},
    ]);

    npm.mock({
      args: ["config", "get", "userconfig"],
      stdout: `${paths.npmrc}${EOL}`,
    });

    npm.mock({
      args: ["view", "my-lib", "version"],
      stderr: "BOOM!",
      exitCode: 1,
    });

    try {
      await npmPublish();
      assert.fail("An error should have been thrown!");
    }
    catch (error) {
      expect(error).to.be.an.instanceOf(Error);
      expect(error.message).to.equal(
        "Unable to determine the current version of my-lib on NPM. \n" +
        "npm view my-lib version exited with a status of 1.\n\n" +
        "BOOM!"
      );
    }

    npm.assert.ran(2);
  });

  it("should fail if the .npmrc file is invalid", async () => {
    files.create([
      { path: "workspace/package.json", contents: { name: "my-lib", version: "2.0.0" }},
      { path: "home/.npmrc/file.txt", contents: "~/.npmrc is a directory, not a file" },
    ]);

    npm.mock({
      args: ["config", "get", "userconfig"],
      stdout: `${paths.npmrc}${EOL}`,
    });

    try {
      await npmPublish();
      assert.fail("An error should have been thrown!");
    }
    catch (error) {
      expect(error).to.be.an.instanceOf(Error);
      expect(error.message).to.include("Unable to read the NPM config file: ");
      expect(error.message).to.include("EISDIR: illegal operation on a directory, read");
    }

    npm.assert.ran(1);
  });

  it('should fail if the "npm config" command errors', async () => {
    files.create([
      { path: "workspace/package.json", contents: { name: "my-lib", version: "2.0.0" }},
    ]);

    npm.mock({
      args: ["config", "get", "userconfig"],
      stderr: "BOOM!",
      exitCode: 1,
    });

    try {
      await npmPublish();
      assert.fail("An error should have been thrown!");
    }
    catch (error) {
      expect(error).to.be.an.instanceOf(Error);
      expect(error.message).to.equal(
        "Unable to determine the NPM config file path. \n" +
        "npm config get userconfig exited with a status of 1.\n\n" +
        "BOOM!"
      );
    }

    npm.assert.ran(1);
  });

  it('should fail if the "npm publish" command errors', async () => {
    files.create([
      { path: "workspace/package.json", contents: { name: "my-lib", version: "2.0.0" }},
    ]);

    npm.mock({
      args: ["config", "get", "userconfig"],
      stdout: `${paths.npmrc}${EOL}`,
    });

    npm.mock({
      args: ["view", "my-lib", "version"],
      stdout: `1.0.0${EOL}`,
    });

    npm.mock({
      args: ["config", "get", "userconfig"],
      stdout: `${paths.npmrc}${EOL}`,
    });

    npm.mock({
      args: ["publish"],
      stderr: "BOOM!",
      exitCode: 1,
    });

    try {
      await npmPublish({ quiet: true });
      assert.fail("An error should have been thrown!");
    }
    catch (error) {
      expect(error).to.be.an.instanceOf(Error);
      expect(error.message).to.equal(
        "Unable to publish my-lib v2.0.0 to NPM. \n" +
        "npm publish exited with a status of 1.\n\n" +
        "BOOM!"
      );
    }

    npm.assert.ran(4);
  });

});
