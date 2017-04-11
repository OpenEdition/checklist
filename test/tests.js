// TODO: ES6 + Babel
// jshint mocha: true

var expect = window.chai.expect;

// Get testFlags
function getFlag (name) {
    return window.testFlags[name];
}

describe("Check execution", function () {
  it("Should run action() when condition (function) is true", function () {
    var flag = getFlag("context-true-function");
    expect(flag).to.equal(true);
  });
});
