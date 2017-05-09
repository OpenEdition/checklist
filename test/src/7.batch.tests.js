describe("Batch", function () {
  let batch;
  const remoteLocation = window.remoteLocation;
  const remoteLocation2 = window.remoteLocation2;

  before(function () {
    batch = checklist.runBatch();
  });

  it("Should return an instance of Batch", function () {
    expect(batch).to.have.property("classname", "Batch");
  });

  it("Should return a promise", function () {
    const res = batch.init();
    expect(res).to.be.a("promise");
  });

  // TODO: rename events in a consistant way and move this test to the "events" section
  it("Should emit the 'ready' event", function (done) {
    batch.once("ready", () => done());
    batch.init();
  });

  it("Should get and store checkers", function (done) {
    batch = checklist.runBatch([remoteLocation, remoteLocation2]);
    batch.once("ready", () => {
      expectAsync(done, () => {
        expect(batch).to.have.property("checkers");
        expect(batch.checkers).to.be.an("array");
        expect(batch.checkers).to.have.lengthOf(2);
        expect(batch.checkers[0]).to.have.property("classname", "Checker");
      });
    });
    batch.init();
  });

});
