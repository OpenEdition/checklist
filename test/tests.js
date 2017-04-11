// TODO: ES6 + Babel
// jshint mocha: true

var expect = window.chai.expect;

// Get testFlags
function getFlag (name) {
    return window.testFlags[name];
}

describe("Context and conditions", function () {
  it("Should run action() when condition (function) is true", function () {
    var flag = getFlag("context-true-function");
    expect(flag).to.equal(true);
  });

  it("Should run action() when condition (string) is true", function () {
    var flag = getFlag("context-true-string");
    expect(flag).to.equal(true);
  });

  it("Should not run action() when condition is false", function () {
    var flag = getFlag("context-false");
    expect(flag).to.equal(undefined);
  });
});
