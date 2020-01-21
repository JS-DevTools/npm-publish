"use strict";

const npm = require("../utils/npm");
const files = require("../utils/files");
const paths = require("../utils/paths");
const npmPublish = require("../utils/npm-publish");
const { expect } = require("chai");
const { EOL } = require("os");

describe("Success tests", () => {

  it("should work create a .npmrc file if necessary", () => {
    files.create([
      { path: "workspace/package.json", contents: { name: "my-lib", version: "2.0.0" }},
    ]);

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
      stdout: `my-lib 2.0.0${EOL}`,
    });

    let cli = npmPublish({
      env: {
        INPUT_TOKEN: "my-secret-token",
      }
    });

    expect(cli).to.have.stderr("");
    expect(cli).to.have.exitCode(0);

    expect(cli).to.have.stdout(
      `::debug::The local version of my-lib is at v1.0.0${EOL}` +
      `my-lib 2.0.0${EOL}` +
      `::debug::Successfully published my-lib v2.0.0 to NPM${EOL}` +
      `::set-output name=type::major${EOL}` +
      `::set-output name=version::2.0.0${EOL}` +
      `::set-output name=old-version::1.0.0${EOL}`
    );

    files.assert.contents("home/.npmrc",
      `registry=//registry.npmjs.org/${EOL}` +
      `//registry.npmjs.org/:_authToken=my-secret-token${EOL}`
    );

    npm.assert.ranSuccessfully();
  });

  it("should append to an existing .npmrc file", () => {
    // TODO
  });

  it("should update an existing .npmrc file's settings", () => {
    // TODO
  });

  it("should publish a package that's not in the root of the workspace directory", () => {
    // TODO
  });

  it("should not attempt to publish if the version hasn't changed", () => {
    // TODO
  });

});
