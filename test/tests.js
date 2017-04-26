// jshint mocha: true, expr: true
var expect = window.chai.expect;

function expectAsync (done, expectation) {
  try {
    expectation();
  } catch (err) {
    return done(err);
  }
  done();
}

// Tests
describe("Configuration", function () {
  var myConfig = {
    parent: "#container",
    context: { hello: "world" },
    rules: [
      {
        name: "Hello world!",
        action: () => this.resolve()
      }
    ]
  };

  it("Should load optional user config from window.checklistUserConfig", function () {
    expect(checklist.config).to.not.be.empty;
    expect(checklist.config).to.deep.equal(window.checklistUserConfig);
  });

  it("Should set config", function () {
    checklist.setConfig(myConfig);
    expect(checklist.config).to.have.deep.property("parent", myConfig.parent);
    expect(checklist.config).to.have.deep.property("context", myConfig.context);
    expect(checklist.config).to.have.deep.property("rules", myConfig.rules);
  });

  it("Should override a property of the config", function () {
    var newContext = { foo: "bar" };
    checklist.setConfig({ context: newContext });
    expect(checklist.config).to.have.deep.property("context", newContext);
    expect(checklist.config).to.have.deep.property("parent", myConfig.parent);
    expect(checklist.config).to.have.deep.property("rules", myConfig.rules);
  });

  it("Should clear config", function () {
    checklist.clear();
    expect(checklist.config).to.be.empty;
  });
});


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
    var checker = checklist.init();
    var arr = [{
      name: "This should run",
      action: () => done()
    }];
    checker.run(arr);
  });

  it("Should run check with run() (object)", function (done) {
    var checker = checklist.init();
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
      expectAsync(done, () => expect(check).to.not.be.undefined);
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
      expectAsync(done, () => expect(statement).to.not.be.undefined);
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
      expectAsync(done, () => expect(flag).to.be.false);
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
      expectAsync(done, () => expect(statement).to.have.property("id", "rule-without-id"));
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
      expectAsync(done, () => expect(statement.count).to.equal(2));
    });
    checker.run();
  });
});

describe("Loader and Sources", function () {
  var loader;

  before(function () {
    checklist.init({});
    loader = window.checklist.loader;
  });

  it("Should create an instance of Loader", function () {
    expect(loader).to.be.instanceof(window.checklist.Loader);
  });

  it("Should get an instance of Source with getSource()", function () {
    var source = loader.getSource("");
    expect(source).to.have.property("classname", "Source");
  });

  it("Should get the 'self' source (with empty string)", function () {
    var source = loader.getSource("");
    expect(source).to.have.property("self", true);
  });

  it("Should get the 'self' source (with actual url)", function () {
    var source = loader.getSource(window.location.href);
    expect(source).to.have.property("self", true);
  });

  it("Should not get a source which doesn't exist", function () {
    var source = loader.getSource("bad-url");
    expect(source).to.be.undefined;
  });
});

describe("Remote Sources", function () {
  var remoteUrl = "./pages/1.html";
  var loader;
  var remoteSource;

  before(function (done) {
    checklist.init({});
    loader = window.checklist.loader;
    loader.requestSource(remoteUrl, (source) => {
      remoteSource = source;
      done();
    });
  });

  it("Should request a new source and store it in loader", function () {
    expect(remoteSource).to.have.property("classname", "Source");
    expect(loader.sources).to.include(remoteSource);
    expect(loader.sources).to.have.lengthOf(2);
  });

  it("Should get the body classes from a remote source", function () {
    expect(remoteSource).to.have.property("bodyClasses");
    expect(remoteSource.bodyClasses).to.include.members(["first-class", "second-class"]);
  });
});


describe("UI", function () {
  var checker;

  before(function () {
    checker = checklist.init({ parent: "#container" });
  });

  it("Should init UI and show panel", function () {
    expect($("#checklist-ui").length).to.equal(1);
  });

  it("Should display notifications into the panel", function (done) {
    checker.on("done", function () {
      expectAsync(done, () => expect($(".checklist-statement")).to.have.lengthOf(2));
    });
    checker.run([
      {
        name: "First rule",
        action: function () {
          this.resolve(true);
        }
      },
      {
        name: "Second rule",
        action: function () {
          this.resolve(true);
        }
      }
    ]);
  });
});
