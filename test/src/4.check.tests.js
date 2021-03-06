describe("Check", function () {

  before((done) => {
    checklist.init().then(() => done());
  });

  beforeEach(function () {
    checklist.config.clear();
  });

  it("Should run action() when condition (function) is true", function (done) {
    checklist.config.set({
      context: {
        yes: true,
        no: false
      }
    });
    const rules = {
      name: "Context is true (function)",
      condition: (context) => context.yes && !context.no,
      action: () => done()
    };
    checklist.run({rules});
  });

  it("Should run action() when condition (string) is true", function (done) {
    checklist.config.set("context", {
      yes: true,
      no: false
    });
    const rules = {
      name: "Context is true (string)",
      condition: "yes && !no",
      action: () => done()
    };
    checklist.run({rules});
  });

  it("Should not run action() when condition is false", function (done) {
    var flag = false;
    checklist.config.set("context", {
      yes: true,
      no: false
    });
    const rules = {
      name: "Context is false",
      condition: "no",
      action: () => flag = true
    };
    checklist.run({rules})
    .then(() => {
      expectAsync(done, () => expect(flag).to.be.false);
    });
  });

  it("Should compute context when it's a function", function (done) {
    checklist.config.set("context", function ($) {
      return {
        yes: $("#container").length === 1,
        no: $("#container").length === 0
      };
    });
    const rules = {
      name: "Context is computed from a function",
      condition: "yes && !no",
      action: () => done()
    };
    checklist.run({rules});
  });

});
