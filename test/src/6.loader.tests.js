describe("Loader and Sources", function () {
  let loader;

  beforeEach(function (done) {
    checklist.reset()
    .then(() => {
      loader = checklist.loader;
      done();
    });
  });

  it("Should create an instance of Loader", function () {
    expect(loader).to.have.property("classname", "Loader");
  });

  it("Should get an instance of Source with getSource()", function () {
    const source = loader.getSource("");
    expect(source).to.have.property("classname", "Source");
  });

  it("Should get the 'self' source (with empty string)", function () {
    const source = loader.getSource("");
    expect(source).to.have.property("self", true);
  });

  it("Should get the 'self' source (with actual url)", function () {
    const source = loader.getSource(window.location.href);
    expect(source).to.have.property("self", true);
  });

  it("Should not get a source which doesn't exist", function () {
    const source = loader.getSource("bad-url");
    expect(source).to.be.undefined;
  });

  describe("Remote Sources", function () {
    const remoteLocation = window.remoteLocation;
    let loader;
    let remoteSource;

    before(function (done) {
      checklist.reset();
      loader = window.checklist.loader;
      loader.requestSource(remoteLocation)
      .then((source) => {
        remoteSource = source;
        done();
      });
    });

    it("Should request a new source and store it in loader", function () {
      expect(remoteSource).to.have.property("classname", "Source");
      expect(loader.sources).to.include(remoteSource);
      expect(loader.sources).to.have.lengthOf(2);
    });

    it("Should get the body classes from a remote source", function () {
      expect(remoteSource).to.have.property("bodyClasses");
      expect(remoteSource.bodyClasses).to.include.members(["first-class", "second-class"]);
    });

    it("Should have a root element", function () {
      expect(remoteSource).to.have.property("root");
      expect(remoteSource.root).to.be.an.instanceof(Element);
    });

    it("Should get a custom $() from the source with '#main' as root", function () {
      var $ = remoteSource.get$();
      var $el = $("h1");
      expect($el).to.have.lengthOf(1);
    });

    it("Should run a check in the remote source", function (done) {
      var id = "remote-source-is-ok";
      checklist.once("check-done", function(check) {
        expectAsync(done, () => {
          expect(check.statements).to.have.lengthOf(1);
          const statement = check.statements[0];
          expect(statement).to.have.property("id", id);
        });
      });
      checklist.run({
        name: "Remote source is OK",
        id: id,
        href: remoteLocation,
        action: function ($) {
          var $el = $("h1");
          if ($el.length === 1 && $el.eq(0).text() === "Remote Test Page") {
            this.notify(true);
          }
          this.resolve();
        }
      });
    });

    it("Should return an error when the remote source doesn't exist", function (done) {
      loader.requestSource("bad-remote-location")
        .then((source) => {
          done(Error("This should never happen because remoteSource doesn't exist"));
        })
        .catch((err) => {
          expectAsync(done, () => expect(err).to.be.an("error"));
        });
    });

    it("Should create a rejection when Source is not found", function (done) {
      checklist.on("check-rejected", () => done());
      checklist.run({
        name: "This should be rejected",
        href: "bad-remote-location",
        action: function () {
          done(Error("This action should never be executed"));
          this.resolve();
        }
      });
    });

    it("Should return an error when the remote selector is not found", function (done) {
      var locationWithBadSelector = [remoteLocation[0], "#this-id-does-not-exist"];
      loader.requestSource(locationWithBadSelector)
        .then((source) => {
          done(Error("This should never happen because target element doesn't exist"));
        })
        .catch((err) => {
          expectAsync(done, () => expect(err).to.be.an("error"));
        });
    });

  });

});
