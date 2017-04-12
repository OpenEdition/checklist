// jshint mocha: true
var expect = window.chai.expect;

// Functions to store and get stuffs
function setFlag (name, value) {
  if (window.testFlags == null) {
    window.testFlags = {};
  }
  window.testFlags[name] = typeof value !== "undefined" ? value : true;
}

function getFlag (name) {
    return window.testFlags[name];
}

// Tests
describe("Context and conditions", function () {
  before(function() {
    checklist.run({
      context: function () {
        return {
          yes: true,
          no: false
        };
      },
      rules: [
        {
          name: "Context is true (function)",
          condition: (context) => context.yes && !context.no,
          action: () => setFlag("context-true-function")
        },
        {
          name: "Context is true (string)",
          condition: "yes && !no",
          action: () => setFlag("context-true-string")
        },
        {
          name: "Context is false",
          condition: "no",
          action: () => setFlag("context-false")
        }
      ]
    });
  });

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
