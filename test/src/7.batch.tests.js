describe("Batch", function () {
  let batch;
  const remoteLocation = window.remoteLocation;
  const remoteLocation2 = window.remoteLocation2;

  before(function (done) {
    const locations = [remoteLocation, remoteLocation2];
    checklist.runBatch(locations).then((res) => {
      batch = res;
      done();
    });
  });

  it("Should return an instance of Batch", function () {
    expect(batch).to.have.property("classname", "Batch");
  });

  it("Should get and store checkers", function (done) {
    checklist.runBatch([remoteLocation, remoteLocation2])
    .then((batch) => {
      expectAsync(done, () => {
        expect(batch).to.have.property("checkers");
        expect(batch.checkers).to.be.an("array");
        expect(batch.checkers).to.have.lengthOf(2);
        expect(batch.checkers[0]).to.have.property("classname", "Checker");
      });
    });
  });
  
});
