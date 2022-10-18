"use strict";

const npmPublish = require("../../../");
const npm = require("../../utils/npm");
const files = require("../../utils/files");
const paths = require("../../utils/paths");
const { expect } = require("chai");
const { EOL } = require("os");
const { join } = require("path");

describe("NPM package - success tests", () => {
  let previousCWD;

  beforeEach(() => {
    previousCWD = process.cwd();
    process.chdir(paths.workspace);
  });

  afterEach(() => {
    process.chdir(previousCWD);
  });

  it("should publish a new version to NPM", async () => {
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
      stdout: `my-lib 2.0.0${EOL}`,
    });

    let results = await npmPublish({ quiet: true });

    expect(results).to.deep.equal({
      type: "major",
      package: "my-lib",
      version: "2.0.0",
      oldVersion: "1.0.0",
      tag: "latest",
      access: "public",
      dryRun: false,
    });

    files.assert.contents("home/.npmrc",
      `//registry.npmjs.org/:_authToken=\${INPUT_TOKEN}${EOL}` +
      `registry=https://registry.npmjs.org/${EOL}`
    );

    npm.assert.ran(4);
  });

  it("should publish a new version to NPM if no package exists", async () => {
    files.create([
      { path: "workspace/package.json", contents: { name: "my-lib", version: "1.0.0" }},
    ]);

    npm.mock({
      args: ["config", "get", "userconfig"],
      stdout: `${paths.npmrc}${EOL}`,
    });

    npm.mock({
      args: ["view", "my-lib", "version"],
      stdout: `${EOL}`,
      stderr: `npm ERR! code E404${EOL}`,
      exitCode: 1,
    });

    npm.mock({
      args: ["config", "get", "userconfig"],
      stdout: `${paths.npmrc}${EOL}`,
    });

    npm.mock({
      args: ["publish"],
      stdout: `my-lib 1.0.0${EOL}`,
    });

    let results = await npmPublish({ quiet: true });

    expect(results).to.deep.equal({
      type: "major",
      package: "my-lib",
      version: "1.0.0",
      oldVersion: "0.0.0",
      tag: "latest",
      access: "public",
      dryRun: false,
    });

    files.assert.contents("home/.npmrc",
      `//registry.npmjs.org/:_authToken=\${INPUT_TOKEN}${EOL}` +
      `registry=https://registry.npmjs.org/${EOL}`
    );

    npm.assert.ran(4);
  });

  it("should publish a new version to NPM if the tag does not exist", async () => {
    files.create([
      { path: "workspace/package.json", contents: { name: "my-lib", version: "1.0.0" }},
    ]);

    npm.mock({
      args: ["config", "get", "userconfig"],
      stdout: `${paths.npmrc}${EOL}`,
    });

    npm.mock({
      args: ["view", "my-lib@my-tag", "version"],
      stdout: `${EOL}`,
    });

    npm.mock({
      args: ["config", "get", "userconfig"],
      stdout: `${paths.npmrc}${EOL}`,
    });

    npm.mock({
      args: ["publish", "--tag", "my-tag"],
      stdout: `my-lib 1.0.0${EOL}`,
    });

    let results = await npmPublish({ tag: "my-tag", quiet: true });

    expect(results).to.deep.equal({
      type: "major",
      package: "my-lib",
      version: "1.0.0",
      oldVersion: "0.0.0",
      tag: "my-tag",
      access: "public",
      dryRun: false,
    });

    files.assert.contents("home/.npmrc",
      `//registry.npmjs.org/:_authToken=\${INPUT_TOKEN}${EOL}` +
      `registry=https://registry.npmjs.org/${EOL}`
    );

    npm.assert.ran(4);
  });

  it("should not publish a new version to NPM if the version number hasn't changed", async () => {
    files.create([
      { path: "workspace/package.json", contents: { name: "my-lib", version: "1.0.0" }},
    ]);

    npm.mock({
      args: ["config", "get", "userconfig"],
      stdout: `${paths.npmrc}${EOL}`,
    });

    npm.mock({
      args: ["view", "my-lib", "version"],
      stdout: `1.0.0${EOL}`,
    });

    let results = await npmPublish({ quiet: true });

    expect(results).to.deep.equal({
      type: "none",
      package: "my-lib",
      version: "1.0.0",
      oldVersion: "1.0.0",
      tag: "latest",
      access: "public",
      dryRun: false,
    });

    files.assert.contents("home/.npmrc",
      `//registry.npmjs.org/:_authToken=\${INPUT_TOKEN}${EOL}` +
      `registry=https://registry.npmjs.org/${EOL}`
    );

    npm.assert.ran(2);
  });

  it("should use the specified NPM token to publish the package", async () => {
    files.create([
      { path: "workspace/package.json", contents: { name: "my-lib", version: "1.0.0-beta.1" }},
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
      env: { INPUT_TOKEN: "my-secret-token" },
      stdout: `my-lib 1.0.0-beta.1${EOL}`,
    });

    let results = await npmPublish({
      quiet: true,
      token: "my-secret-token",
    });

    expect(results).to.deep.equal({
      type: "prerelease",
      package: "my-lib",
      version: "1.0.0-beta.1",
      oldVersion: "1.0.0",
      tag: "latest",
      access: "public",
      dryRun: false,
    });

    files.assert.contents("home/.npmrc",
      `//registry.npmjs.org/:_authToken=\${INPUT_TOKEN}${EOL}` +
      `registry=https://registry.npmjs.org/${EOL}`
    );

    npm.assert.ran(4);
  });

  it("should append to an existing .npmrc file", async () => {
    files.create([
      { path: "workspace/package.json", contents: { name: "my-lib", version: "1.1.0" }},
      { path: "home/.npmrc", contents: "This is my NPM config.\nThere are many like it,\nbut this one is mine." },
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
      stdout: `my-lib 1.1.0${EOL}`,
    });

    let results = await npmPublish({ quiet: true });

    expect(results).to.deep.equal({
      type: "minor",
      package: "my-lib",
      version: "1.1.0",
      oldVersion: "1.0.0",
      tag: "latest",
      access: "public",
      dryRun: false
    });

    files.assert.contents("home/.npmrc",
      `This is my NPM config.${EOL}` +
      `There are many like it,${EOL}` +
      `but this one is mine.${EOL}` +
      `${EOL}` +
      `//registry.npmjs.org/:_authToken=\${INPUT_TOKEN}${EOL}` +
      `registry=https://registry.npmjs.org/${EOL}`
    );

    npm.assert.ran(4);
  });

  it("should update an existing .npmrc file's settings", async () => {
    files.create([
      { path: "workspace/package.json", contents: { name: "my-lib", version: "1.0.1" }},
      {
        path: "home/.npmrc",
        contents:
          "# Use the GitHub package registry\n" +
          "registry=https://registry.github.com/\n" +
          "https://registry.github.com/:_authToken=my-github-token\n" +
          "\n" +
          "# Use the NPM registry with no auth\n" +
          "registry=https://registry.npmjs.org/\n" +
          "\n" +
          "# Use some other package registry\n" +
          "registry=https://registry.example.com/\n"
      },
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
      stdout: `my-lib 1.0.1${EOL}`,
    });

    let results = await npmPublish({ quiet: true });

    expect(results).to.deep.equal({
      type: "patch",
      package: "my-lib",
      version: "1.0.1",
      oldVersion: "1.0.0",
      tag: "latest",
      access: "public",
      dryRun: false
    });

    files.assert.contents("home/.npmrc",
      `# Use the GitHub package registry${EOL}` +
      `${EOL}` +
      `# Use the NPM registry with no auth${EOL}` +
      `${EOL}` +
      `# Use some other package registry${EOL}` +
      `${EOL}` +
      `${EOL}` +
      `//registry.npmjs.org/:_authToken=\${INPUT_TOKEN}${EOL}` +
      `registry=https://registry.npmjs.org/${EOL}`
    );

    npm.assert.ran(4);
  });

  it("should publish a package that's not in the root of the workspace directory", async () => {
    files.create([
      { path: "workspace/subdir/my-lib/package.json", contents: { name: "my-lib", version: "1.0.0-beta" }},
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
      cwd: join(paths.workspace, "subdir/my-lib"),
      stdout: `my-lib 1.0.0-beta${EOL}`,
    });

    let results = await npmPublish({
      quiet: true,
      package: "subdir/my-lib/package.json",
    });

    expect(results).to.deep.equal({
      type: "prerelease",
      package: "my-lib",
      version: "1.0.0-beta",
      oldVersion: "1.0.0",
      tag: "latest",
      access: "public",
      dryRun: false,
    });

    files.assert.contents("home/.npmrc",
      `//registry.npmjs.org/:_authToken=\${INPUT_TOKEN}${EOL}` +
      `registry=https://registry.npmjs.org/${EOL}`
    );

    npm.assert.ran(4);
  });

  it("should publish a scoped package", async () => {
    files.create([
      { path: "workspace/package.json", contents: { name: "@my-scope/my-lib", version: "2.0.0" }},
    ]);

    npm.mock({
      args: ["config", "get", "userconfig"],
      stdout: `${paths.npmrc}${EOL}`,
    });

    npm.mock({
      args: ["view", "@my-scope/my-lib", "version"],
      stdout: `1.0.0${EOL}`,
    });

    npm.mock({
      args: ["config", "get", "userconfig"],
      stdout: `${paths.npmrc}${EOL}`,
    });

    npm.mock({
      args: ["publish"],
      stdout: `@my-scope/my-lib 2.0.0${EOL}`,
    });

    let results = await npmPublish({ quiet: true });

    expect(results).to.deep.equal({
      type: "major",
      package: "@my-scope/my-lib",
      version: "2.0.0",
      oldVersion: "1.0.0",
      tag: "latest",
      access: "restricted",
      dryRun: false,
    });

    files.assert.contents("home/.npmrc",
      `//registry.npmjs.org/:_authToken=\${INPUT_TOKEN}${EOL}` +
      `registry=https://registry.npmjs.org/${EOL}`
    );

    npm.assert.ran(4);
  });

  it("should publish to a specific tag", async () => {
    files.create([
      { path: "workspace/package.json", contents: { name: "my-lib", version: "2.0.0" }},
    ]);

    npm.mock({
      args: ["config", "get", "userconfig"],
      stdout: `${paths.npmrc}${EOL}`,
    });

    npm.mock({
      args: ["view", "my-lib@next", "version"],
      stdout: `1.0.0${EOL}`,
    });

    npm.mock({
      args: ["config", "get", "userconfig"],
      stdout: `${paths.npmrc}${EOL}`,
    });

    npm.mock({
      args: ["publish", "--tag", "next"],
      stdout: `my-lib 2.0.0${EOL}`,
    });

    let results = await npmPublish({ tag: "next", quiet: true });

    expect(results).to.deep.equal({
      type: "major",
      package: "my-lib",
      version: "2.0.0",
      oldVersion: "1.0.0",
      tag: "next",
      access: "public",
      dryRun: false,
    });

    files.assert.contents("home/.npmrc",
      `//registry.npmjs.org/:_authToken=\${INPUT_TOKEN}${EOL}` +
      `registry=https://registry.npmjs.org/${EOL}`
    );

    npm.assert.ran(4);
  });

  it("should publish a scoped package with public access", async () => {
    files.create([
      { path: "workspace/package.json", contents: { name: "@my-scope/my-lib", version: "2.0.0" }},
    ]);

    npm.mock({
      args: ["config", "get", "userconfig"],
      stdout: `${paths.npmrc}${EOL}`,
    });

    npm.mock({
      args: ["view", "@my-scope/my-lib", "version"],
      stdout: `1.0.0${EOL}`,
    });

    npm.mock({
      args: ["config", "get", "userconfig"],
      stdout: `${paths.npmrc}${EOL}`,
    });

    npm.mock({
      args: ["publish", "--access", "public"],
      stdout: `@my-scope/my-lib 2.0.0${EOL}`,
    });

    let results = await npmPublish({ access: "public", quiet: true });

    expect(results).to.deep.equal({
      type: "major",
      package: "@my-scope/my-lib",
      version: "2.0.0",
      oldVersion: "1.0.0",
      tag: "latest",
      access: "public",
      dryRun: false,
    });

    files.assert.contents("home/.npmrc",
      `//registry.npmjs.org/:_authToken=\${INPUT_TOKEN}${EOL}` +
      `registry=https://registry.npmjs.org/${EOL}`
    );

    npm.assert.ran(4);
  });

  it("results.dryRun should be true when called with --dry-run", async () => {
    files.create([
      { path: "workspace/package.json", contents: { name: "my-lib", version: "1.1.0" }},
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
      args: ["publish", "--dry-run"],
      stdout: `my-lib 1.1.0${EOL}`,
    });

    let results = await npmPublish({
      quiet: true,
      package: "package.json",
      dryRun: true
    });

    expect(results).to.deep.equal({
      type: "minor",
      package: "my-lib",
      version: "1.1.0",
      oldVersion: "1.0.0",
      tag: "latest",
      access: "public",
      dryRun: true
    });

    files.assert.contents("home/.npmrc",
      `//registry.npmjs.org/:_authToken=\${INPUT_TOKEN}${EOL}` +
      `registry=https://registry.npmjs.org/${EOL}`
    );

    npm.assert.ran(4);
  });

});
