"use strict";

const projectExportName = require("../../");
const { expect } = require("chai");

describe("projectExportName() API", () => {

  it("should work without any arguments", () => {
    let result = projectExportName();
    expect(result).to.equal("Hello, world.");
  });

  it("should accept a custom greeting", () => {
    let result = projectExportName({ greeting: "Hi there" });
    expect(result).to.equal("Hi there, world.");
  });

  it("should accept a custom subject", () => {
    let result = projectExportName({ subject: "Michael" });
    expect(result).to.equal("Hello, Michael.");
  });

  it("should accept a custom greeting and subject", () => {
    let result = projectExportName({ greeting: "Yo", subject: "man" });
    expect(result).to.equal("Yo, man.");
  });

  it('should not allow a greeting of "goodbye"', () => {
    function sayGoodbye () {
      projectExportName({ greeting: "Goodbye" });
    }

    expect(sayGoodbye).to.throw("Cannot say goodbye");
  });

});
