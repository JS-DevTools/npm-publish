"use strict";

const npm = require("../../utils/npm");
const files = require("../../utils/files");
const paths = require("../../utils/paths");
const exec = require("../../utils/exec");
const { expect } = require("chai");
const { EOL } = require("os");
const { join } = require("path");

describe("GitHub Action - success tests", () => {
  it("should publish a new version to NPM", () => {
    files.create([
      {
        path: "workspace/package.json",
        contents: { name: "my-lib", version: "2.0.0" },
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
      env: { INPUT_TOKEN: "my-secret-token" },
      stdout: `my-lib 2.0.0${EOL}`,
    });

    let cli = exec.action({
      env: {
        INPUT_TOKEN: "my-secret-token",
      },
    });

    expect(cli).to.have.stderr("");
    expect(cli).stdout.to.include("my-lib 2.0.0");
    expect(cli).stdout.to.include(
      "Successfully published my-lib v2.0.0 to https://registry.npmjs.org/"
    );
    expect(cli).stdout.to.include("TEST::set-output name=type::major");
    expect(cli).stdout.to.include("TEST::set-output name=version::2.0.0");
    expect(cli).stdout.to.include("TEST::set-output name=old-version::1.0.0");
    expect(cli).stdout.to.include("TEST::set-output name=tag::latest");
    expect(cli).stdout.to.include("TEST::set-output name=access::public");
    expect(cli).stdout.to.include("TEST::set-output name=dry-run::false");
    expect(cli).to.have.exitCode(0);

    files.assert.contents(
      "home/.npmrc",
      `//registry.npmjs.org/:_authToken=\${INPUT_TOKEN}${EOL}` +
        `registry=https://registry.npmjs.org/${EOL}`
    );

    npm.assert.ran(4);
  });

  it("should publish a new version to NPM if the version is lower", () => {
    files.create([
      {
        path: "workspace/package.json",
        contents: { name: "my-lib", version: "0.1.0" },
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
      env: { INPUT_TOKEN: "my-secret-token" },
      stdout: `my-lib 0.1.0${EOL}`,
    });

    let cli = exec.action({
      env: {
        INPUT_TOKEN: "my-secret-token",
      },
    });

    expect(cli).to.have.stderr("");
    expect(cli).stdout.to.include("my-lib 0.1.0");
    expect(cli).stdout.to.include(
      "Successfully published my-lib v0.1.0 to https://registry.npmjs.org/"
    );
    expect(cli).stdout.to.include("TEST::set-output name=type::major");
    expect(cli).stdout.to.include("TEST::set-output name=version::0.1.0");
    expect(cli).stdout.to.include("TEST::set-output name=old-version::1.0.0");
    expect(cli).stdout.to.include("TEST::set-output name=tag::latest");
    expect(cli).stdout.to.include("TEST::set-output name=access::public");
    expect(cli).stdout.to.include("TEST::set-output name=dry-run::false");
    expect(cli).to.have.exitCode(0);

    files.assert.contents(
      "home/.npmrc",
      `//registry.npmjs.org/:_authToken=\${INPUT_TOKEN}${EOL}` +
        `registry=https://registry.npmjs.org/${EOL}`
    );

    npm.assert.ran(4);
  });

  it("should not publish a new version to NPM if the version is lower and greaterVersion flag is set", () => {
    files.create([
      {
        path: "workspace/package.json",
        contents: { name: "my-lib", version: "0.1.0" },
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
      env: { INPUT_TOKEN: "my-secret-token" },
      stdout: `my-lib 0.1.0${EOL}`,
    });

    let cli = exec.action({
      env: {
        INPUT_TOKEN: "my-secret-token",
        "INPUT_GREATER-VERSION-ONLY": "true",
      },
    });

    expect(cli).to.have.stderr("");
    expect(cli).stdout.to.include(
      "my-lib v0.1.0 is lower than the version published to https://registry.npmjs.org/"
    );
    expect(cli).stdout.to.include("TEST::set-output name=type::lower");
    expect(cli).stdout.to.include("TEST::set-output name=version::0.1.0");
    expect(cli).stdout.to.include("TEST::set-output name=old-version::1.0.0");
    expect(cli).stdout.to.include("TEST::set-output name=tag::latest");
    expect(cli).stdout.to.include("TEST::set-output name=access::public");
    expect(cli).stdout.to.include("TEST::set-output name=dry-run::false");
    expect(cli).to.have.exitCode(0);

    files.assert.contents(
      "home/.npmrc",
      `//registry.npmjs.org/:_authToken=\${INPUT_TOKEN}${EOL}` +
        `registry=https://registry.npmjs.org/${EOL}`
    );

    npm.assert.ran(4);
  });

  it("should publish a new version to NPM if no package exists", async () => {
    files.create([
      {
        path: "workspace/package.json",
        contents: { name: "my-lib", version: "1.0.0" },
      },
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

    let cli = exec.action({
      env: {
        INPUT_TOKEN: "my-secret-token",
      },
    });

    expect(cli).to.have.stderr("");
    expect(cli).stdout.to.include("my-lib 1.0.0");
    expect(cli).stdout.to.include(
      "Successfully published my-lib v1.0.0 to https://registry.npmjs.org/"
    );
    expect(cli).stdout.to.include("TEST::set-output name=type::major");
    expect(cli).stdout.to.include("TEST::set-output name=version::1.0.0");
    expect(cli).stdout.to.include("TEST::set-output name=old-version::0.0.0");
    expect(cli).stdout.to.include("TEST::set-output name=tag::latest");
    expect(cli).stdout.to.include("TEST::set-output name=access::public");
    expect(cli).stdout.to.include("TEST::set-output name=dry-run::false");
    expect(cli).to.have.exitCode(0);

    files.assert.contents(
      "home/.npmrc",
      `//registry.npmjs.org/:_authToken=\${INPUT_TOKEN}${EOL}` +
        `registry=https://registry.npmjs.org/${EOL}`
    );

    npm.assert.ran(4);
  });

  it("should publish a new version to NPM if the tag does not exist", async () => {
    files.create([
      {
        path: "workspace/package.json",
        contents: { name: "my-lib", version: "1.0.0" },
      },
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

    let cli = exec.action({
      env: {
        INPUT_TOKEN: "my-secret-token",
        INPUT_TAG: "my-tag",
      },
    });

    expect(cli).to.have.stderr("");
    expect(cli).stdout.to.include("my-lib 1.0.0");
    expect(cli).stdout.to.include(
      "Successfully published my-lib v1.0.0 to https://registry.npmjs.org/"
    );
    expect(cli).stdout.to.include("TEST::set-output name=type::major");
    expect(cli).stdout.to.include("TEST::set-output name=version::1.0.0");
    expect(cli).stdout.to.include("TEST::set-output name=old-version::0.0.0");
    expect(cli).stdout.to.include("TEST::set-output name=tag::my-tag");
    expect(cli).stdout.to.include("TEST::set-output name=access::public");
    expect(cli).stdout.to.include("TEST::set-output name=dry-run::false");
    expect(cli).to.have.exitCode(0);

    files.assert.contents(
      "home/.npmrc",
      `//registry.npmjs.org/:_authToken=\${INPUT_TOKEN}${EOL}` +
        `registry=https://registry.npmjs.org/${EOL}`
    );

    npm.assert.ran(4);
  });

  it("should not publish a new version to NPM if the version number hasn't changed", () => {
    files.create([
      {
        path: "workspace/package.json",
        contents: { name: "my-lib", version: "1.0.0" },
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

    let cli = exec.action({
      env: {
        INPUT_TOKEN: "my-secret-token",
      },
    });

    expect(cli).to.have.stderr("");
    expect(cli).stdout.to.include(
      "📦 my-lib v1.0.0 is already published to https://registry.npmjs.org/"
    );
    expect(cli).stdout.to.include("TEST::set-output name=type::none");
    expect(cli).stdout.to.include("TEST::set-output name=version::1.0.0");
    expect(cli).stdout.to.include("TEST::set-output name=old-version::1.0.0");
    expect(cli).stdout.to.include("TEST::set-output name=tag::latest");
    expect(cli).stdout.to.include("TEST::set-output name=access::public");
    expect(cli).stdout.to.include("TEST::set-output name=dry-run::false");
    expect(cli).to.have.exitCode(0);

    files.assert.contents(
      "home/.npmrc",
      `//registry.npmjs.org/:_authToken=\${INPUT_TOKEN}${EOL}` +
        `registry=https://registry.npmjs.org/${EOL}`
    );

    npm.assert.ran(2);
  });

  it("should append to an existing .npmrc file", () => {
    files.create([
      {
        path: "workspace/package.json",
        contents: { name: "my-lib", version: "1.1.0" },
      },
      {
        path: "home/.npmrc",
        contents:
          "This is my NPM config.\nThere are many like it,\nbut this one is mine.",
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
      env: { INPUT_TOKEN: "my-secret-token" },
      stdout: `my-lib 1.1.0${EOL}`,
    });

    let cli = exec.action({
      env: {
        INPUT_TOKEN: "my-secret-token",
      },
    });

    expect(cli).to.have.stderr("");
    expect(cli).stdout.to.include("my-lib 1.1.0");
    expect(cli).stdout.to.include(
      "📦 Successfully published my-lib v1.1.0 to https://registry.npmjs.org/"
    );
    expect(cli).stdout.to.include("TEST::set-output name=type::minor");
    expect(cli).stdout.to.include("TEST::set-output name=version::1.1.0");
    expect(cli).stdout.to.include("TEST::set-output name=old-version::1.0.0");
    expect(cli).stdout.to.include("TEST::set-output name=tag::latest");
    expect(cli).stdout.to.include("TEST::set-output name=access::public");
    expect(cli).stdout.to.include("TEST::set-output name=dry-run::false");
    expect(cli).to.have.exitCode(0);

    files.assert.contents(
      "home/.npmrc",
      `This is my NPM config.${EOL}` +
        `There are many like it,${EOL}` +
        `but this one is mine.${EOL}` +
        `${EOL}` +
        `//registry.npmjs.org/:_authToken=\${INPUT_TOKEN}${EOL}` +
        `registry=https://registry.npmjs.org/${EOL}`
    );

    npm.assert.ran(4);
  });

  it("should update an existing .npmrc file's settings", () => {
    files.create([
      {
        path: "workspace/package.json",
        contents: { name: "my-lib", version: "1.0.1" },
      },
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
          "registry=https://registry.example.com/\n",
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
      env: { INPUT_TOKEN: "my-secret-token" },
      stdout: `my-lib 1.0.1${EOL}`,
    });

    let cli = exec.action({
      env: {
        INPUT_TOKEN: "my-secret-token",
      },
    });

    expect(cli).to.have.stderr("");
    expect(cli).stdout.to.include("my-lib 1.0.1");
    expect(cli).stdout.to.include(
      "📦 Successfully published my-lib v1.0.1 to https://registry.npmjs.org/"
    );
    expect(cli).stdout.to.include("TEST::set-output name=type::patch");
    expect(cli).stdout.to.include("TEST::set-output name=version::1.0.1");
    expect(cli).stdout.to.include("TEST::set-output name=old-version::1.0.0");
    expect(cli).stdout.to.include("TEST::set-output name=tag::latest");
    expect(cli).stdout.to.include("TEST::set-output name=access::public");
    expect(cli).stdout.to.include("TEST::set-output name=dry-run::false");
    expect(cli).to.have.exitCode(0);

    files.assert.contents(
      "home/.npmrc",
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

  it("should publish a package that's not in the root of the workspace directory", () => {
    files.create([
      {
        path: "workspace/subdir/my-lib/package.json",
        contents: { name: "my-lib", version: "1.0.0-beta" },
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
      cwd: join(paths.workspace, "subdir/my-lib"),
      env: { INPUT_TOKEN: "my-secret-token" },
      stdout: `my-lib 1.0.0-beta${EOL}`,
    });

    let cli = exec.action({
      env: {
        INPUT_TOKEN: "my-secret-token",
        INPUT_PACKAGE: "subdir/my-lib/package.json",
      },
    });

    expect(cli).to.have.stderr("");
    expect(cli).stdout.to.include("my-lib 1.0.0-beta");
    expect(cli).stdout.to.include(
      "📦 Successfully published my-lib v1.0.0-beta to https://registry.npmjs.org/"
    );
    expect(cli).stdout.to.include("TEST::set-output name=type::prerelease");
    expect(cli).stdout.to.include("TEST::set-output name=version::1.0.0-beta");
    expect(cli).stdout.to.include("TEST::set-output name=old-version::1.0.0");
    expect(cli).stdout.to.include("TEST::set-output name=tag::latest");
    expect(cli).stdout.to.include("TEST::set-output name=access::public");
    expect(cli).stdout.to.include("TEST::set-output name=dry-run::false");
    expect(cli).to.have.exitCode(0);

    files.assert.contents(
      "home/.npmrc",
      `//registry.npmjs.org/:_authToken=\${INPUT_TOKEN}${EOL}` +
        `registry=https://registry.npmjs.org/${EOL}`
    );

    npm.assert.ran(4);
  });

  it("should publish a scoped package", () => {
    files.create([
      {
        path: "workspace/package.json",
        contents: { name: "@my-scope/my-lib", version: "2.0.0" },
      },
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
      env: { INPUT_TOKEN: "my-secret-token" },
      stdout: `@my-scope/my-lib 2.0.0${EOL}`,
    });

    let cli = exec.action({
      env: {
        INPUT_TOKEN: "my-secret-token",
      },
    });

    expect(cli).to.have.stderr("");
    expect(cli).stdout.to.include("@my-scope/my-lib 2.0.0");
    expect(cli).stdout.to.include(
      "Successfully published @my-scope/my-lib v2.0.0 to https://registry.npmjs.org/"
    );
    expect(cli).stdout.to.include("TEST::set-output name=type::major");
    expect(cli).stdout.to.include("TEST::set-output name=version::2.0.0");
    expect(cli).stdout.to.include("TEST::set-output name=old-version::1.0.0");
    expect(cli).stdout.to.include("TEST::set-output name=tag::latest");
    expect(cli).stdout.to.include("TEST::set-output name=access::restricted");
    expect(cli).stdout.to.include("TEST::set-output name=dry-run::false");
    expect(cli).to.have.exitCode(0);

    files.assert.contents(
      "home/.npmrc",
      `//registry.npmjs.org/:_authToken=\${INPUT_TOKEN}${EOL}` +
        `registry=https://registry.npmjs.org/${EOL}`
    );

    npm.assert.ran(4);
  });

  it("should publish to a specific tag", () => {
    files.create([
      {
        path: "workspace/package.json",
        contents: { name: "my-lib", version: "2.0.0" },
      },
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
      env: { INPUT_TOKEN: "my-secret-token" },
      stdout: `my-lib 2.0.0${EOL}`,
    });

    let cli = exec.action({
      env: {
        INPUT_TOKEN: "my-secret-token",
        INPUT_TAG: "next",
      },
    });

    expect(cli).to.have.stderr("");
    expect(cli).stdout.to.include("my-lib 2.0.0");
    expect(cli).stdout.to.include(
      "Successfully published my-lib v2.0.0 to https://registry.npmjs.org/"
    );
    expect(cli).stdout.to.include("TEST::set-output name=type::major");
    expect(cli).stdout.to.include("TEST::set-output name=version::2.0.0");
    expect(cli).stdout.to.include("TEST::set-output name=old-version::1.0.0");
    expect(cli).stdout.to.include("TEST::set-output name=tag::next");
    expect(cli).stdout.to.include("TEST::set-output name=access::public");
    expect(cli).stdout.to.include("TEST::set-output name=dry-run::false");
    expect(cli).to.have.exitCode(0);

    files.assert.contents(
      "home/.npmrc",
      `//registry.npmjs.org/:_authToken=\${INPUT_TOKEN}${EOL}` +
        `registry=https://registry.npmjs.org/${EOL}`
    );

    npm.assert.ran(4);
  });

  it("should publish a scoped package with public access", () => {
    files.create([
      {
        path: "workspace/package.json",
        contents: { name: "@my-scope/my-lib", version: "2.0.0" },
      },
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
      env: { INPUT_TOKEN: "my-secret-token" },
      stdout: `@my-scope/my-lib 2.0.0${EOL}`,
    });

    let cli = exec.action({
      env: {
        INPUT_TOKEN: "my-secret-token",
        INPUT_ACCESS: "public",
      },
    });

    expect(cli).to.have.stderr("");
    expect(cli).stdout.to.include("@my-scope/my-lib 2.0.0");
    expect(cli).stdout.to.include(
      "Successfully published @my-scope/my-lib v2.0.0 to https://registry.npmjs.org/"
    );
    expect(cli).stdout.to.include("TEST::set-output name=type::major");
    expect(cli).stdout.to.include("TEST::set-output name=version::2.0.0");
    expect(cli).stdout.to.include("TEST::set-output name=old-version::1.0.0");
    expect(cli).stdout.to.include("TEST::set-output name=tag::latest");
    expect(cli).stdout.to.include("TEST::set-output name=access::public");
    expect(cli).stdout.to.include("TEST::set-output name=dry-run::false");
    expect(cli).to.have.exitCode(0);

    files.assert.contents(
      "home/.npmrc",
      `//registry.npmjs.org/:_authToken=\${INPUT_TOKEN}${EOL}` +
        `registry=https://registry.npmjs.org/${EOL}`
    );

    npm.assert.ran(4);
  });

  it("should not publish a package if dryRun is true", () => {
    files.create([
      {
        path: "workspace/package.json",
        contents: { name: "my-lib", version: "1.1.0" },
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
      args: ["publish", "--dry-run"],
      env: { INPUT_TOKEN: "my-secret-token" },
      stdout: `my-lib 1.1.0${EOL}`,
    });

    let cli = exec.action({
      env: {
        INPUT_TOKEN: "my-secret-token",
        "INPUT_DRY-RUN": "true",
      },
    });

    expect(cli).to.have.stderr("");
    expect(cli).stdout.to.include("TEST::set-output name=type::minor");
    expect(cli).stdout.to.include("TEST::set-output name=version::1.1.0");
    expect(cli).stdout.to.include("TEST::set-output name=old-version::1.0.0");
    expect(cli).stdout.to.include("TEST::set-output name=tag::latest");
    expect(cli).stdout.to.include("TEST::set-output name=access::public");
    expect(cli).stdout.to.include("TEST::set-output name=dry-run::true");
    expect(cli).stdout.to.include("my-lib 1.1.0");
    expect(cli).stdout.to.include(
      "📦 my-lib v1.1.0 was NOT actually published to https://registry.npmjs.org/ (dry run)"
    );
    expect(cli).to.have.exitCode(0);

    npm.assert.ran(4);
  });
});
