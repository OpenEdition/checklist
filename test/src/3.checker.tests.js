describe("Checker and .run()", function () {

  describe("Execution", function () {

    it("Should return a promise", function () {
      const res = checklist.run();
      expect(res).to.be.a("promise");
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

});
