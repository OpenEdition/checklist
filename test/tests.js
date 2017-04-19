// jshint mocha: true
var expect = window.chai.expect;

// Tests
describe("Initialization and execution", function () {
  it("Should return a Checker instance", function () {
    var checker = checklist.start({ parent: false });
    expect(checker).to.be.an.instanceof(checklist.Checker);
  });

  it("Should run checks on start()", function (done) {
    checklist.start({
      parent: false,
      rules: [
        {
          name: "This should run",
          action: () => done()
        }
      ]
    });
  });

  it("Should run check with run() (array)", function (done) {
    var checker = checklist.start({ parent: false });
    var arr = [{
      name: "This should run",
      action: () => done()
    }];
    checker.run(arr);
  });

  it("Should run check with run() (object)", function (done) {
    var checker = checklist.start({ parent: false });
    var obj = {
      name: "This should run",
      action: () => done()
    };
    checker.run(obj);
  });

  it("Should run callback when checker is done", function (done) {
    checklist.start({
      parent: false,
      callback: () => done()
    });
  });
});

describe("Context and conditions", function () {
  it("Should run action() when condition (function) is true", function (done) {
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
          action: () => done()
        }
      ]
    });
  });

  it("Should run action() when condition (string) is true", function (done) {
    checklist.start({
      parent: false,
      context: {
        yes: true,
        no: false
      },
      rules: [
        {
          name: "Context is true (string)",
          condition: "yes && !no",
          action: () => done()
        }
      ]
    });
  });

  it("Should not run action() when condition is false", function (done) {
    var flag = false;
    checklist.start({
      parent: false,
      context: {
        yes: true,
        no: false
      },
      rules: [
        {
          name: "Context is false",
          condition: "no",
          action: () => flag = true
        }
      ],
      callback: function () {
        var arg = flag ? Error("flag should be false") : null;
        done(arg);
      }
    });
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
