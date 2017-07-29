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
      },
      "isBatch": (batch) => {
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

  before((done) => {
    checklist.init().then(() => done());
  });

  describe("Checker", function () {

    before(function (done) {
      checklist.init()
      .then(() => {
        done();
      });
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
      checklist.run(rules.done);
    });

    it("Should emit the 'check.success' event with an argument", function (done) {
      checklist.once("check.success", getHandler("isCheck", done));
      checklist.run(rules.done);
    });

    // FIXME: this test leads to an error message in the browser console
    it("Should emit the 'check.rejected' event with two arguments", function (done) {
      checklist.once("check.rejected", getHandler("isCheckRejected", done));
      checklist.run(rules.rejected);
    });

    it("Should emit the 'statement.new' event with an argument", function (done) {
      checklist.once("statement.new", getHandler("isStatement", done));
      checklist.run(rules.statement);
    });

  });

  describe("Batch", function () {

    const remoteHref = window.remoteHref;
    const remoteHref2 = window.remoteHref2;
    const hrefs = [remoteHref, remoteHref2];

    before(function (done) {
      checklist.init()
      .then(() => {
        done();
      });
    });

    it("Should emit the 'batch.run' event", function (done) {
      checklist.once("batch.run", getHandler("isBatch", done));
      checklist.runBatch(hrefs, rules.done);
    });

    it("Should emit the 'batch.done' event", function (done) {
      checklist.once("batch.done", getHandler("isBatch", done));
      checklist.runBatch(hrefs, rules.done);
    });

    it("Should emit the 'checker.run' event", function (done) {
      checklist.once("checker.run", getHandler("isChecker", done));
      checklist.run();
    });

    it("Should emit the 'checker.done' event", function (done) {
      checklist.once("checker.done", getHandler("isChecker", done));
      checklist.runBatch(hrefs, rules.done);
    });

    it("Should emit the 'check.run' event", function (done) {
      checklist.once("check.run", getHandler("isCheck", done));
      checklist.run();
    });

    it("Should emit the 'check.done' event with an argument", function (done) {
      checklist.once("check.done", getHandler("isCheck", done));
      checklist.runBatch(hrefs, rules.done);
    });

    it("Should emit the 'check.success' event with an argument", function (done) {
      checklist.once("check.success", getHandler("isCheck", done));
      checklist.runBatch(hrefs, rules.done);
    });

    // FIXME: this test leads to an error message in the browser console
    it("Should emit the 'check.rejected' event with two arguments", function (done) {
      checklist.once("check.rejected", getHandler("isCheckRejected", done));
      checklist.runBatch(hrefs, rules.rejected);
    });

    it("Should emit the 'statement.new' event with an argument", function (done) {
      checklist.once("statement.new", getHandler("isStatement", done));
      checklist.runBatch(hrefs, rules.statement);
    });

  });

});
