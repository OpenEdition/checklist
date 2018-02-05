describe("Checker and .run()", function () {
  const remoteHref = window.remoteHref;

  before((done) => {
    checklist.init().then(() => done());
  });

  beforeEach(function () {
    checklist.config.clear();
  });

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
    checklist.run({rules: arr});
  });

  it("Should run check() (object)", function (done) {
    const obj = {
      name: "This should run",
      action: () => done()
    };
    checklist.run({rules: obj});
  });

  it("Should load rules from config if not defined", function (done) {
    const rules = [{
      name: "This should run",
      action: () => done()
    }];
    checklist.config.set("rules", rules);
    checklist.run();
  });

  it("Should run Checker with remote href", function (done) {
    const href = remoteHref;
    const rules = {
      name: "This should run",
      action: ($) => {
        const title = $("title").text();
        expectAsync(done, () => {
          expect(title).to.equal("Page 1");
        });
      }
    };
    checklist.run({href, rules});
  });

});
