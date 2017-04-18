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
describe("Initialization and execution", function () {
  it("Should return a Checker instance", function () {
    var checker = checklist.start({
      parent: false,
      context: {},
      rules: []
    });
    expect(checker).to.be.an.instanceof(checklist.Checker);
  });

  it("Should run checks on start()", function (done) {
    checklist.start({
      parent: false,
      context: {},
      rules: [
        {
          name: "This should run",
          action: () => done()
        }
      ]
    });
  });
});

describe("Context and conditions", function () {
  before(function() {
    checklist.start({
      parent: false,
      context: {
        yes: true,
        no: false
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

  it("Should compute context when it's a function", function (done) {
    checklist.start({
      parent: false,
      context: function () {
        return {
          yes: $("body").length === 1,
          no: $("body").length === 0
        };
      },
      rules: [
        {
          name: "Context is computed from a function",
          condition: "yes && !no",
          action: () => done()
        }
      ]
    });
  });
});
