"use strict";

const commonJSExport = require("../../");
const { default: defaultExport, projectExportName: namedExport } = require("../../");
const { expect } = require("chai");

describe("project-package-name package exports", () => {

  it("should export the projectExportName() function as the default CommonJS export", () => {
    expect(commonJSExport).to.be.a("function");
    expect(commonJSExport.name).to.equal("projectExportName");
  });

  it("should export the projectExportName() function as the default ESM export", () => {
    expect(defaultExport).to.be.a("function");
    expect(defaultExport).to.equal(commonJSExport);
  });

  it("should export the projectExportName() function as a named export", () => {
    expect(namedExport).to.be.a("function");
    expect(namedExport).to.equal(commonJSExport);
  });

  it("should not export anything else", () => {
    expect(commonJSExport).to.have.same.keys(
      "default",
      "projectExportName",
    );
  });

});
