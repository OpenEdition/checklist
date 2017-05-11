describe("Events", function () {

  it("Should emit the 'checker.done' event", function (done) {
    checklist.once("checker.done", (checker) => {
      expectAsync(done, () => {
        expect(checker).to.have.property("classname", "Checker");
      });
    });
    checklist.run();
  });

  it("Should emit the 'check.done' event with an argument", function (done) {
    checklist.once("check.done", (check) => {
      expectAsync(done, () => {
        expect(check).to.have.property("classname", "Check");
      });
    });
    checklist.run({
      name: "This should run",
      action: function () {
        this.resolve();
      }
    });
  });

  it("Should emit the 'check.success' event with an argument", function (done) {
    // FIXME: same code than the previous test
    checklist.once("check.success", (check) => {
      expectAsync(done, () => {
        expect(check).to.have.property("classname", "Check");
      });
    });
    checklist.run({
      name: "This should run",
      action: function () {
        this.resolve();
      }
    });
  });

  // FIXME: this test leads to an error message in the browser console
  it("Should emit the 'check.rejected' event with two arguments", function (done) {
    checklist.once("check.rejected", (err, check) => {
      expectAsync(done, () => {
        expect(err).to.be.an("error");
        expect(check).to.have.property("classname", "Check");
      });
    });
    checklist.run({
      name: "This should be rejected",
      action: function () {
        this.reject("Rejection message");
      }
    });
  });

  it("Should emit the 'statement' event with an argument", function (done) {
    checklist.once("statement", (statement) => {
      expectAsync(done, () => {
        expect(statement).to.not.be.undefined;
        expect(statement).to.have.property("classname", "Statement");
      });
    });
    checklist.run({
      name: "This should run",
      action: function () {
        this.resolve(true);
      }
    });
  });

});
