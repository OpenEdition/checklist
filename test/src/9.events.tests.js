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
      "statement": (statement) => {
        expectAsync(done, () => {
          expect(statement).to.not.be.undefined;
          expect(statement).to.have.property("classname", "Statement");
        });
      }
    };
    return handlers[eventName];
  }

  describe("Checker", function () {

    it("Should emit the 'checker.done' event", function (done) {
      checklist.once("checker.done", getHandler("checker.done", done));
      checklist.run();
    });

    it("Should emit the 'check.done' event with an argument", function (done) {
      checklist.once("check.done", getHandler("check.done+success", done));
      checklist.run({
        name: "This should run",
        action: function () {
          this.resolve();
        }
      });
    });

    it("Should emit the 'check.success' event with an argument", function (done) {
      checklist.once("check.done", getHandler("check.done+success", done));
      checklist.run({
        name: "This should run",
        action: function () {
          this.resolve();
        }
      });
    });

    // FIXME: this test leads to an error message in the browser console
    it("Should emit the 'check.rejected' event with two arguments", function (done) {
      checklist.once("check.rejected", getHandler("check.rejected", done));
      checklist.run({
        name: "This should be rejected",
        action: function () {
          this.reject("Rejection message");
        }
      });
    });

    it("Should emit the 'statement' event with an argument", function (done) {
      checklist.once("statement", getHandler("statement", done));
      checklist.run({
        name: "This should run",
        action: function () {
          this.resolve(true);
        }
      });
    });

  });

});
