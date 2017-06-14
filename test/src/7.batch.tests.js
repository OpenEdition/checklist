describe("Batch", function () {
  let batch;
  const remoteHref = window.remoteHref;
  const remoteHref2 = window.remoteHref2;

  before(function (done) {
    checklist.init().then(() => {
      const hrefs = [remoteHref, remoteHref2];
      checklist.runBatch(hrefs).then((res) => {
        batch = res;
        done();
      });
    });
  });

  it("Should return an instance of Batch", function () {
    expect(batch).to.have.property("classname", "Batch");
  });

  it("Should get and store checkers", function (done) {
    checklist.runBatch([remoteHref, remoteHref2])
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
