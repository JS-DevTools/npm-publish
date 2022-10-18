"use strict";

const npm = require("../../utils/npm");
const files = require("../../utils/files");
const exec = require("../../utils/exec");
const { expect } = require("chai");
const manifest = require("../../../package.json");

describe("CLI - argument tests", () => {

  it("should error if an invalid argument is used", () => {
    let cli = exec.cli("--debug", "--help", "--fizzbuzz", "--quiet");

    expect(cli).to.have.exitCode(9);
    expect(cli).to.have.stdout("");
    expect(cli.stderr).to.match(/^Unknown option: --fizzbuzz\n\nUsage: npm-publish \[options\] \[package_path\]\n/);
  });

  it("should error if an invalid shorthand argument is used", () => {
    let cli = exec.cli("-dqzv");

    expect(cli).to.have.exitCode(9);
    expect(cli).to.have.stdout("");
    expect(cli.stderr).to.match(/^Unknown option: -z\n\nUsage: npm-publish \[options\] \[package_path\]\n/);
  });

  it("should print a more detailed error if DEBUG is set", () => {
    process.env.DEBUG = "true";
    let cli = exec.cli();

    expect(cli).to.have.stdout("");
    expect(cli).to.have.exitCode(1);

    expect(cli).to.have.stderr.that.matches(/^Error: Unable to read package.json \nENOENT: no such file or directory/);
    expect(cli).to.have.stderr.that.matches(/\n    at /);

    process.env.DEBUG = "";
  });

  describe("npm-publish --help", () => {
    it("should show usage text", () => {
      let cli = exec.cli("--help");

      expect(cli).to.have.exitCode(0);
      expect(cli).to.have.stderr("");
      expect(cli.stdout).to.match(/^\nUsage: npm-publish \[options\] \[package_path\]\n/);
    });

    it("should support -h shorthand", () => {
      let cli = exec.cli("-h");

      expect(cli).to.have.exitCode(0);
      expect(cli).to.have.stderr("");
      expect(cli.stdout).to.match(/^\nUsage: npm-publish \[options\] \[package_path\]\n/);
    });

    it("should ignore other arguments", () => {
      let cli = exec.cli("--quiet", "--help", "--version");

      expect(cli).to.have.exitCode(0);
      expect(cli).to.have.stderr("");
      expect(cli.stdout).to.match(/^\nUsage: npm-publish \[options\] \[package_path\]\n/);
    });

    it("should ignore other shorthand arguments", () => {
      let cli = exec.cli("-dhv");

      expect(cli).to.have.exitCode(0);
      expect(cli).to.have.stderr("");
      expect(cli.stdout).to.match(/^\nUsage: npm-publish \[options\] \[package_path\]\n/);
    });
  });

  describe("npm-publish --version", () => {
    it("should show the version number", () => {
      let cli = exec.cli("--version");

      expect(cli).to.have.exitCode(0);
      expect(cli).to.have.stderr("");
      expect(cli).to.have.stdout(manifest.version + "\n");
    });

    it("should support -v shorthand", () => {
      let cli = exec.cli("-v");

      expect(cli).to.have.exitCode(0);
      expect(cli).to.have.stderr("");
      expect(cli).to.have.stdout(manifest.version + "\n");
    });

    it("should ignore other arguments", () => {
      let cli = exec.cli("--quiet", "--version", "--debug");

      expect(cli).to.have.exitCode(0);
      expect(cli).to.have.stderr("");
      expect(cli).to.have.stdout(manifest.version + "\n");
    });

    it("should ignore other shorthand arguments", () => {
      let cli = exec.cli("-dvq");

      expect(cli).to.have.exitCode(0);
      expect(cli).to.have.stderr("");
      expect(cli).to.have.stdout(manifest.version + "\n");
    });
  });

  describe("npm-publish --token", () => {
    it("should error if the --token is missing its value", () => {
      let cli = exec.cli("--quiet", "--token", "--version");

      expect(cli).to.have.exitCode(9);
      expect(cli).to.have.stdout("");
      expect(cli.stderr).to.match(/^The --token argument requires a value\n\nUsage: npm-publish \[options\] \[package_path\]\n/);
    });
  });

  describe("npm-publish --registry", () => {
    it("should error if the --registry is missing its value", () => {
      let cli = exec.cli("--quiet", "--registry", "--version");

      expect(cli).to.have.exitCode(9);
      expect(cli).to.have.stdout("");
      expect(cli.stderr).to.match(/^The --registry argument requires a value\n\nUsage: npm-publish \[options\] \[package_path\]\n/);
    });

    it("should fail if the NPM registry URL is invalid", () => {
      files.create([
        { path: "workspace/package.json", contents: { name: "my-lib", version: "1.2.3" }},
      ]);

      let cli = exec.cli("--registry", "example.com");

      expect(cli).to.have.stdout("");
      expect(cli).stderr.to.include("Invalid URL: example.com");
      expect(cli).to.have.exitCode(1);

      files.assert.doesNotExist("home/.npmrc");
      npm.assert.ran(0);
    });
  });

});
