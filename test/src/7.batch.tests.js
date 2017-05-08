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

  // TODO: rename events in a consistant way and move this test to the "events" section
  it("Should emit the 'ready' event", function (done) {
    batch.on("ready", () => done());
    batch.init();
  });

  it("Should get and store Sources", function (done) {
    batch = checklist.runBatch([remoteLocation, remoteLocation2]);
    batch.on("ready", () => {
      expectAsync(done, () => {
        expect(batch).to.have.property("sources");
        expect(batch.sources).to.be.an("array");
        expect(batch.sources).to.have.lengthOf(2);
        expect(batch.sources[0]).to.have.property("classname", "Source");
      });
    });
    batch.init();
  });

});
