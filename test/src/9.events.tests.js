describe("Events", function () {

  function getHandler (eventName, done) {
    const handlers = {
      "checker.done": (checker) => {
        expectAsync(done, () => {
          expect(checker).to.have.property("classname", "Checker");
        });
      },
      "check.done+success": (check) => {
        expectAsync(done, () => {
          expect(check).to.have.property("classname", "Check");
        });
      },
      "check.rejected": (err, check) => {
        expectAsync(done, () => {
          expect(err).to.be.an("error");
          expect(check).to.have.property("classname", "Check");
        });
      },
      "statement.new": (statement) => {
        expectAsync(done, () => {
          expect(statement).to.not.be.undefined;
          expect(statement).to.have.property("classname", "Statement");
        });
      },
      "batch.done": (batch) => {
        expectAsync(done, () => {
          expect(batch).to.have.property("classname", "Batch");
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
    }
  };

  before(function (done) {
    checklist.reset()
    .then(() => {
      done();
    });
  });

  describe("Checker", function () {

    it("Should emit the 'checker.done' event", function (done) {
      checklist.once("checker.done", getHandler("checker.done", done));
      checklist.run();
    });

    it("Should emit the 'check.done' event with an argument", function (done) {
      checklist.once("check.done", getHandler("check.done+success", done));
      checklist.run(rules.done);
    });

    it("Should emit the 'check.success' event with an argument", function (done) {
      checklist.once("check.success", getHandler("check.done+success", done));
      checklist.run(rules.done);
    });

    // FIXME: this test leads to an error message in the browser console
    it("Should emit the 'check.rejected' event with two arguments", function (done) {
      checklist.once("check.rejected", getHandler("check.rejected", done));
      checklist.run(rules.rejected);
    });

    it("Should emit the 'statement.new' event with an argument", function (done) {
      checklist.once("statement.new", getHandler("statement.new", done));
      checklist.run(rules.statement);
    });

  });

  describe("Batch", function () {

    const remoteLocation = window.remoteLocation;
    const remoteLocation2 = window.remoteLocation2;
    const locations = [remoteLocation, remoteLocation2];

    it("Should emit the 'batch.done' event", function (done) {
      checklist.once("batch.done", getHandler("batch.done", done));
      checklist.runBatch(locations, rules.done);
    });

    it("Should emit the 'checker.done' event", function (done) {
      checklist.once("checker.done", getHandler("checker.done", done));
      checklist.runBatch(locations, rules.done);
    });

    it("Should emit the 'check.done' event with an argument", function (done) {
      checklist.once("check.done", getHandler("check.done+success", done));
      checklist.runBatch(locations, rules.done);
    });

    it("Should emit the 'check.success' event with an argument", function (done) {
      checklist.once("check.success", getHandler("check.done+success", done));
      checklist.runBatch(locations, rules.done);
    });

    // FIXME: this test leads to an error message in the browser console
    it("Should emit the 'check.rejected' event with two arguments", function (done) {
      checklist.once("check.rejected", getHandler("check.rejected", done));
      checklist.runBatch(locations, rules.rejected);
    });

    it("Should emit the 'statement.new' event with an argument", function (done) {
      checklist.once("statement.new", getHandler("statement.new", done));
      checklist.runBatch(locations, rules.statement);
    });

  });

});