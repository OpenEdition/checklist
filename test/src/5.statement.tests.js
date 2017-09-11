describe("Statement", function () {

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

  before((done) => {
    checklist.init().then(() => done());
  });

  beforeEach(function () {
    checklist.config.clear();
  });

  it("Should create a statement using default rule values", function (done) {
    checklist.once("statement.new", function(statement) {
      checkStatement(statement, defaultValues, done);
    });
    const rules = {
      name: defaultValues.name,
      id: defaultValues.id,
      description: defaultValues.description,
      action: function () {
        this.resolve(true);
      }
    };
    checklist.run({rules});
  });

  it("Should create a statement using values given in resolve()/notify()", function (done) {
    checklist.once("statement.new", function(statement) {
      checkStatement(statement, otherValues, done);
    });
    const rules = {
      name: defaultValues.name,
      id: defaultValues.id,
      description: defaultValues.description,
      action: function () {
        this.resolve(otherValues);
      }
    };
    checklist.run({rules});
  });

  it("Should generate an id from name", function (done) {
    checklist.once("statement.new", function(statement) {
      expectAsync(done, () => expect(statement).to.have.property("id", "rule-without-id"));
    });
    const rules = {
      name: "Rule without id",
      action: function () {
        this.resolve(true);
      }
    };
    checklist.run({rules});
  });

  it("Should increment count", function (done) {
    checklist.once("statement.update", function(statement) {
      expectAsync(done, () => expect(statement.count).to.equal(2));
    });
    const rules = {
      name: "Some rule",
      id: "some-rule",
      action: function () {
        this.notify(true);
        this.resolve(true);
      }
    };
    checklist.run({rules});
  });

});
