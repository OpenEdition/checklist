// jshint mocha: true
var expect = window.chai.expect;

// Tests
describe("Initialization and execution", function () {
  beforeEach(function () {
    checklist.clear();
  });

  it("Should return a Checker instance", function () {
    var checker = checklist.start({ parent: false });
    expect(checker).to.be.an.instanceof(checklist.Checker);
  });

  it("Should run checks on start()", function (done) {
    checklist.start({
      rules: [
        {
          name: "This should run",
          action: () => done()
        }
      ]
    });
  });

  it("Should run check with run() (array)", function (done) {
    var checker = checklist.start();
    var arr = [{
      name: "This should run",
      action: () => done()
    }];
    checker.run(arr);
  });

  it("Should run check with run() (object)", function (done) {
    var checker = checklist.start();
    var obj = {
      name: "This should run",
      action: () => done()
    };
    checker.run(obj);
  });
});

describe("Events and callbacks", function (){
  beforeEach(function () {
    checklist.clear();
  });

  it("Should run callback when checker is done", function (done) {
    var callback = () => done();
    checklist.start({}, callback);
  });

  it("Should emit the 'done' event", function (done) {
    var checker = checklist.init();
    checker.on("done", () => done());
    checker.run();
  });

  it("Should emit the 'check-done' event with an argument", function (done) {
    var checker = checklist.init({
      rules: [
        {
          name: "This should run",
          action: function () {
            this.resolve();
          }
        }
      ]
    });
    checker.on("check-done", function(check) {
      var arg = typeof check === "undefined" ? Error("check is undefined") : null;
      done(arg);
    });
    checker.run();
  });

  it("Should emit the 'statement' event with an argument", function (done) {
    var checker = checklist.init({
      rules: [
        {
          name: "This should run",
          action: function () {
            this.resolve(true);
          }
        }
      ]
    });
    checker.on("statement", function(statement) {
      var arg = typeof statement === "undefined" ? Error("statement is undefined") : null;
      done(arg);
    });
    checker.run();
  });
});

describe("Context and conditions", function () {
  beforeEach(function () {
    checklist.clear();
  });

  it("Should run action() when condition (function) is true", function (done) {
    checklist.start({
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
    var callback = function () {
      var arg = flag ? Error("flag should be false") : null;
      done(arg);
    };
    checklist.start({
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
      ]
    }, callback);
  });

  it("Should compute context when it's a function", function (done) {
    checklist.start({
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

describe("Statements", function () {
  var defaultValues = {
    name: "Default name",
    id: "default-id",
    description: "Default description"
  };

  var otherValues = {
    name: "Other name",
    id: "other-id",
    description: "Other description"
  };

  function checkStatement (statement, expectedValues, done) {
    var keys = Object.keys(expectedValues);
    var badKeys = keys.filter((key) => statement[key] !== expectedValues[key]);
    if (badKeys.length > 0) {
      var badValues = [];
      badKeys.forEach((key) => badValues.push(`'${key}' is '${statement[key]}' but should be '${expectedValues[key]}'`));
      done(Error(`Default statement values are not used: ${badValues.toString()}`));
    } else {
      done();
    }
  }

  beforeEach(function () {
    checklist.clear();
  });

  it("Should create a statement using default rule values", function (done) {
    var checker = checklist.init({
      rules: [
        {
          name: defaultValues.name,
          id: defaultValues.id,
          description: defaultValues.description,
          action: function () {
            this.resolve(true);
          }
        }
      ]
    });
    checker.on("statement", function(statement) {
      checkStatement(statement, defaultValues, done);
    });
    checker.run();
  });

  it("Should create a statement using values given in resolve()/notify()", function (done) {
    var checker = checklist.init({
      rules: [
        {
          name: defaultValues.name,
          id: defaultValues.id,
          description: defaultValues.description,
          action: function () {
            this.resolve(otherValues);
          }
        }
      ]
    });
    checker.on("statement", function(statement) {
      checkStatement(statement, otherValues, done);
    });
    checker.run();
  });

  it("Should generate an id from name", function (done) {
    var checker = checklist.init({
      rules: [
        {
          name: "Rule without id",
          action: function () {
            this.resolve(true);
          }
        }
      ]
    });
    checker.on("statement", function(statement) {
      var arg = statement.id !== "rule-without-id" ? Error(`Unexpected id: ${statement.id}`) : null;
      done(arg);
    });
    checker.run();
  });

  it("Should increment count", function (done) {
    var checker = checklist.init({
      rules: [
        {
          name: "Some rule",
          id: "some-rule",
          action: function () {
            this.notify(true);
            this.resolve(true);
          }
        }
      ]
    });
    checker.on("duplicate", function(statement) {
      var arg = statement.count !== 2 ? Error(`count is ${statement.count} instead of 2`) : null;
      done(arg);
    });
    checker.run();
  });
});

describe("UI", function () {
  it("Should init UI and show panel", function () {
    it("Should return a Checker instance", function () {
      checklist.start({ parent: "#container" });
      expect($("#checklist-ui").length).to.equal(1);
    });
  });
});
