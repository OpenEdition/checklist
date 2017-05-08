describe("Checker and .run()", function () {

  describe("Execution", function () {

    it("Should return a promise", function (done) {
      checklist.run()
      .then(() => done());
    });

    it("Should pass a Checker instance in then()", function (done) {
      checklist.run()
      .then((checker) => {
        expectAsync(done, () => {
          expect(checker).to.have.property("classname", "Checker");
        });
      });
    });

    it("Should run check() (array)", function (done) {
      const arr = [{
        name: "This should run",
        action: () => done()
      }];
      checklist.run(arr);
    });

    it("Should run check() (object)", function (done) {
      const obj = {
        name: "This should run",
        action: () => done()
      };
      checklist.run(obj);
    });

    it("Should store rejections in Checker.rejections", function (done) {
      var rules = [
        {
          name: "This should be rejected",
          action: function () {
            this.reject("Rejection message");
          }
        },
        {
          name: "This should be also rejected",
          action: function () {
            this.reject("Another rejection message");
          }
        }
      ];
      const callback = function (checker) {
        expectAsync(done, () => {
          expect(checker).to.have.property("rejections");
          expect(checker.rejections).to.have.lengthOf(2);
          var rejection = checker.rejections[0];
          expect(rejection).to.have.all.keys("check", "error");
          expect(rejection.check).to.have.property("classname", "Check");
          expect(rejection.error).to.be.an("error");
        });
      };
      checklist.run(rules).then(callback);
    });

  });

  describe("Events", function () {

    it("Should emit the 'checker-done' event", function (done) {
      checklist.once("checker-done", (checker) => {
        expectAsync(done, () => {
          expect(checker).to.have.property("classname", "Checker");
        });
      });
      checklist.run();
    });

    it("Should emit the 'check-done' event with an argument", function (done) {
      checklist.once("check-done", (check) => {
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

    it("Should emit the 'check-success' event with an argument", function (done) {
      // FIXME: same code than the previous test
      checklist.once("check-success", (check) => {
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
    it("Should emit the 'check-rejected' event with two arguments", function (done) {
      checklist.once("check-rejected", (err, check) => {
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

});
