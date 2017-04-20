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
});

describe("Events and callbacks", function (){
  it("Should run callback when checker is done", function (done) {
    var callback = () => done();
    checklist.start({ parent: false }, callback);
  });

  it("Should emit the 'done' event", function (done) {
    var checker = checklist.init({ parent: false });
    checker.on("done", () => done());
    checker.run();
  });

  it("Should emit the 'check-done' event with an argument", function (done) {
    var checker = checklist.init({
      parent: false,
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
      parent: false,
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
    var callback = function () {
      var arg = flag ? Error("flag should be false") : null;
      done(arg);
    };
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
      ]
    }, callback);
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

describe("Statements", function () {
  it("Should create a statement using default rule values", function (done) {
    var defaultValues = {
      name: "Default name",
      id: "default-id",
      description: "Default description"
    };

    var checker = checklist.init({
      parent: false,
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
      var keys = Object.keys(defaultValues);
      var badKeys = keys.filter((key) => statement[key] !== defaultValues[key]);
      if (badKeys.length > 0) {
        var badValues = [];
        badKeys.forEach((key) => badValues.push(`'${key}' is '${statement[key]}' but should be '${defaultValues[key]}'`));
        done(Error(`Default statement values are not used: ${badValues.toString()}`));
      } else {
        done();
      }
    });
    checker.run();
  });
});
