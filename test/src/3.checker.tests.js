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

  it("Should get Checker statements", function (done) {
    const obj = {
      name: "This should run",
      action: function () {
        this.notify("foo");
        this.resolve("bar");
      }
    };
    checklist.run({rules: obj})
    .then((checker) => {
      const statements = checker.getStatements();
      expectAsync(done, () => {
        expect(statements).to.be.an.instanceof(Array);
        expect(statements).to.have.lengthOf(2);
        expect(statements[0]).to.have.property("classname", "Statement");
      });
    });
  });

  it("Should export Checker", function (done) {
    checklist.run()
    .then((checker) => {
      const exported = checker.export();
      expectAsync(done, () => {
        expect(exported).to.have.all.keys("checks", "context", "docId", "states");
      });
    });
  });
  
});
