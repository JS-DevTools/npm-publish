"use strict";

const projectExportName = require("../utils/project-cli-name");
const manifest = require("../../package.json");
const { expect } = require("chai");

describe("project-cli-name", () => {

  it("should run without any arguments", () => {
    // Run the CLI without any arguments.
    let cli = projectExportName("");

    // It should have printed the default greeting
    expect(cli).to.have.stdout("Hello, world.\n");
  });

  it("should error if an invalid argument is used", () => {
    let cli = projectExportName("--fizzbuzz");

    expect(cli).to.have.exitCode(9);
    expect(cli).to.have.stdout("");
    expect(cli).to.have.stderr.that.matches(/^Unknown option: --fizzbuzz\n\nUsage: project-cli-name \[options\] \[files...\]\n/);
  });

  it("should error if an invalid shorthand argument is used", () => {
    let cli = projectExportName("-qhzt");

    expect(cli).to.have.exitCode(9);
    expect(cli).to.have.stdout("");
    expect(cli).to.have.stderr.that.matches(/^Unknown option: -z\n\nUsage: project-cli-name \[options\] \[files...\]\n/);
  });

  it("should error if an argument is missing its value", () => {
    let cli = projectExportName("--subject");

    expect(cli).to.have.exitCode(9);
    expect(cli).to.have.stdout("");
    expect(cli).to.have.stderr.that.matches(/^The --subject option requires a value\.\n\nUsage: project-cli-name \[options\] \[files...\]\n/);
  });

  it("should print a more detailed error if DEBUG is set", () => {
    let cli = projectExportName("--greeting Goodbye", { env: { DEBUG: "true" }});

    expect(cli).to.have.stdout("");
    expect(cli).to.have.exitCode(1);
    expect(cli).to.have.stderr.that.matches(/^Error: Cannot say goodbye\n\s+at \w+/);
  });

});

describe("project-cli-name --help", () => {

  it("should show usage text", () => {
    let cli = projectExportName("--help");

    expect(cli).to.have.exitCode(0);
    expect(cli).to.have.stderr("");
    expect(cli).to.have.stdout.that.contains(manifest.description);
    expect(cli).to.have.stdout.that.matches(/\nUsage: project-cli-name \[options\] \[files...\]\n/);
  });

  it("should support -h shorthand", () => {
    let cli = projectExportName("-h");

    expect(cli).to.have.exitCode(0);
    expect(cli).to.have.stderr("");
    expect(cli).to.have.stdout.that.contains(manifest.description);
    expect(cli).to.have.stdout.that.matches(/\nUsage: project-cli-name \[options\] \[files...\]\n/);
  });

  it("should ignore other arguments", () => {
    let cli = projectExportName("--quiet --help --version");

    expect(cli).to.have.exitCode(0);
    expect(cli).to.have.stderr("");
    expect(cli).to.have.stdout.that.contains(manifest.description);
    expect(cli).to.have.stdout.that.matches(/\nUsage: project-cli-name \[options\] \[files...\]\n/);
  });

  it("should ignore other shorthand arguments", () => {
    let cli = projectExportName("-qhv");

    expect(cli).to.have.exitCode(0);
    expect(cli).to.have.stderr("");
    expect(cli).to.have.stdout.that.contains(manifest.description);
    expect(cli).to.have.stdout.that.matches(/\nUsage: project-cli-name \[options\] \[files...\]\n/);
  });

});

describe("project-cli-name --version", () => {

  it("should show the version number", () => {
    let cli = projectExportName("--version");

    expect(cli).to.have.exitCode(0);
    expect(cli).to.have.stderr("");
    expect(cli).to.have.stdout(manifest.version + "\n");
  });

  it("should support -v shorthand", () => {
    let cli = projectExportName("-v");

    expect(cli).to.have.exitCode(0);
    expect(cli).to.have.stderr("");
    expect(cli).to.have.stdout(manifest.version + "\n");
  });

  it("should ignore other arguments", () => {
    let cli = projectExportName("--quiet --version");

    expect(cli).to.have.exitCode(0);
    expect(cli).to.have.stderr("");
    expect(cli).to.have.stdout(manifest.version + "\n");
  });

  it("should ignore other shorthand arguments", () => {
    let cli = projectExportName("-qv");

    expect(cli).to.have.exitCode(0);
    expect(cli).to.have.stderr("");
    expect(cli).to.have.stdout(manifest.version + "\n");
  });

});
