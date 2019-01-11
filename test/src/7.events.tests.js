describe("Events", function () {

  function getHandler (eventName, done) {
    const handlers = {
      "isChecker": (checker) => {
        expectAsync(done, () => {
          expect(checker).to.have.property("classname", "Checker");
        });
      },
      "isCheck": (check) => {
        expectAsync(done, () => {
          expect(check).to.have.property("classname", "Check");
        });
      },
      "isCheckRejected": (err, check) => {
        expectAsync(done, () => {
          expect(err).to.be.an("error");
          expect(check).to.have.property("classname", "Check");
        });
      },
      "isStatement": (statement) => {
        expectAsync(done, () => {
          expect(statement).to.not.be.undefined;
          expect(statement).to.have.property("classname", "Statement");
        });
      }
    };
    return handlers[eventName];
  }

  const rules = {
    done: {
      name: "This should run",
      action: function () {
        this.resolve();
      }
    },
    rejected: {
      name: "This should be rejected",
      action: function () {
        this.reject("Rejection message");
      }
    },
    statement: {
      name: "This should run",
      action: function () {
        this.resolve(true);
      }
    },
    timeout: {
      name: "This should be rejected with a timeout error message",
      action: function () {}
    }
  };

  before((done) => {
    checklist.init({ checkTimeout: 1000 }).then(() => done());
  });

  it("Should emit the 'checker.run' event", function (done) {
    checklist.once("checker.run", getHandler("isChecker", done));
    checklist.run();
  });

  it("Should emit the 'checker.done' event", function (done) {
    checklist.once("checker.done", getHandler("isChecker", done));
    checklist.run();
  });

  it("Should emit the 'check.run' event", function (done) {
    checklist.once("check.run", getHandler("isCheck", done));
    checklist.run();
  });

  it("Should emit the 'check.done' event with an argument", function (done) {
    checklist.once("check.done", getHandler("isCheck", done));
    checklist.run({rules: rules.done});
  });

  it("Should emit the 'check.success' event with an argument", function (done) {
    checklist.once("check.success", getHandler("isCheck", done));
    checklist.run({rules: rules.done});
  });

  it("Should emit the 'check.rejected' event with two arguments", function (done) {
    checklist.once("check.rejected", getHandler("isCheckRejected", done));
    checklist.run({rules: rules.rejected});
  });

  it("Should emit the 'check.rejected' event when resolve() is missing (timeout)", function (done) {
    checklist.once("check.rejected", getHandler("isCheckRejected", done));
    checklist.run({rules: rules.timeout});
  });

  it("Should emit the 'statement.new' event with an argument", function (done) {
    checklist.once("statement.new", getHandler("isStatement", done));
    checklist.run({rules: rules.statement});
  });

});
