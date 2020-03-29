"use strict";

const npm = require("../../utils/npm");
const files = require("../../utils/files");
const paths = require("../../utils/paths");
const exec = require("../../utils/exec");
const { expect } = require("chai");
const { EOL } = require("os");

describe("GitHub Action - failure tests", () => {

  it("should fail if the NPM token isn't set", () => {
    let cli = exec.action({
      env: {
        INPUT_TOKEN: "",
      }
    });

    expect(cli).to.have.stderr("");
    expect(cli).stdout.to.include("::error::Error: Input required and not supplied: token");
    expect(cli).to.have.exitCode(1);

    files.assert.doesNotExist("home/.npmrc");
    files.assert.doesNotExist("workspace/package.json");
    npm.assert.didNotRun();
  });

  it("should fail if the NPM registry URL is invalid", () => {
    files.create([
      { path: "workspace/package.json", contents: { name: "my-lib", version: "1.2.3" }},
    ]);

    let cli = exec.action({
      env: {
        INPUT_TOKEN: "my-secret-token",
        INPUT_REGISTRY: "example.com",
      }
    });

    expect(cli).to.have.stderr("");
    expect(cli).stdout.to.include("::error::TypeError [ERR_INVALID_URL] [ERR_INVALID_URL]: Invalid URL: example.com");
    expect(cli).to.have.exitCode(1);

    files.assert.doesNotExist("home/.npmrc");
    npm.assert.ran(0);
  });

  it("should fail if the package.json file does not exist", () => {
    let cli = exec.action({
      env: {
        INPUT_TOKEN: "my-secret-token",
      }
    });

    expect(cli).to.have.stderr("");
    expect(cli).stdout.to.include("::error::Error: Unable to read package.json %0AENOENT: no such file or directory");
    expect(cli).to.have.exitCode(1);

    files.assert.doesNotExist("home/.npmrc");
    files.assert.doesNotExist("workspace/package.json");
    npm.assert.didNotRun();
  });

  it("should fail if the package.json file is invalid", () => {
    files.create([
      { path: "workspace/package.json", contents: "hello, world" },
    ]);

    let cli = exec.action({
      env: {
        INPUT_TOKEN: "my-secret-token",
      }
    });

    expect(cli).to.have.stderr("");
    expect(cli).stdout.to.include("::error::SyntaxError: Unable to parse package.json");
    expect(cli).stdout.to.include("Unexpected token h in JSON at position 0");
    expect(cli).to.have.exitCode(1);

    files.assert.doesNotExist("home/.npmrc");
    npm.assert.didNotRun();
  });

  it("should fail if the package name is invalid", () => {
    files.create([
      { path: "workspace/package.json", contents: { name: "\n  \t" }},
    ]);

    let cli = exec.action({
      env: {
        INPUT_TOKEN: "my-secret-token",
      }
    });

    expect(cli).to.have.stderr("");
    expect(cli).stdout.to.include("::error::TypeError: Unable to parse package.json");
    expect(cli).stdout.to.include("Invalid package name");
    expect(cli).to.have.exitCode(1);

    files.assert.doesNotExist("home/.npmrc");
    npm.assert.didNotRun();
  });

  it("should fail if the package version is invalid", () => {
    files.create([
      { path: "workspace/package.json", contents: { name: "my-lib", version: "hello, world" }},
    ]);

    let cli = exec.action({
      env: {
        INPUT_TOKEN: "my-secret-token",
      }
    });

    expect(cli).to.have.stderr("");
    expect(cli).stdout.to.include("::error::TypeError: Unable to parse package.json");
    expect(cli).stdout.to.include("Invalid Version: hello, world");
    expect(cli).to.have.exitCode(1);

    files.assert.doesNotExist("home/.npmrc");
    npm.assert.didNotRun();
  });

  it('should fail if the "npm view" command errors', () => {
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

    let cli = exec.action({
      env: {
        INPUT_TOKEN: "my-secret-token",
      }
    });

    expect(cli).to.have.stderr("");
    expect(cli).stdout.to.include("::error::Error: Unable to determine the current version of my-lib on NPM.");
    expect(cli).stdout.to.include("npm view my-lib version exited with a status of 1");
    expect(cli).stdout.to.include("BOOM!");
    expect(cli).to.have.exitCode(1);

    npm.assert.ran(2);
  });

  it("should fail if the .npmrc file is invalid", () => {
    files.create([
      { path: "workspace/package.json", contents: { name: "my-lib", version: "2.0.0" }},
      { path: "home/.npmrc/file.txt", contents: "~/.npmrc is a directory, not a file" },
    ]);

    npm.mock({
      args: ["config", "get", "userconfig"],
      stdout: `${paths.npmrc}${EOL}`,
    });

    let cli = exec.action({
      env: {
        INPUT_TOKEN: "my-secret-token",
      }
    });

    expect(cli).to.have.stderr("");
    expect(cli).stdout.to.include("::error::Error: Unable to read the NPM config file: ");
    expect(cli).stdout.to.include("Error: EISDIR: illegal operation on a directory, read");
    expect(cli).to.have.exitCode(1);

    npm.assert.ran(1);
  });

  it('should fail if the "npm config" command errors', () => {
    files.create([
      { path: "workspace/package.json", contents: { name: "my-lib", version: "2.0.0" }},
    ]);

    npm.mock({
      args: ["config", "get", "userconfig"],
      stderr: "BOOM!",
      exitCode: 1,
    });

    let cli = exec.action({
      env: {
        INPUT_TOKEN: "my-secret-token",
      }
    });

    expect(cli).to.have.stderr("");
    expect(cli).stdout.to.include("::error::Error: Unable to determine the NPM config file path.");
    expect(cli).stdout.to.include("npm config get userconfig exited with a status of 1");
    expect(cli).stdout.to.include("BOOM!");
    expect(cli).to.have.exitCode(1);

    npm.assert.ran(1);
  });

  it('should fail if the "npm publish" command errors', () => {
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

    let cli = exec.action({
      env: {
        INPUT_TOKEN: "my-secret-token",
      }
    });

    expect(cli).to.have.stderr("BOOM!");
    expect(cli).stdout.to.include("::error::Error: Unable to publish my-lib v2.0.0 to NPM.");
    expect(cli).stdout.to.include("npm publish exited with a status of 1");
    expect(cli).stdout.not.to.include("BOOM!");
    expect(cli).to.have.exitCode(1);

    npm.assert.ran(4);
  });

});
