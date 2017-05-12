describe("UI", function () {

  before(function (done) {
    checklist.reset({ parent: "#container" })
    .then(() => done());
  });

  it("Should init UI and show panel", function () {
    expect($("#checklist-ui").length).to.equal(1);
  });

  it("Should display notifications into the panel", function (done) {
    checklist.once("ui.injected.statements", function () {
      expectAsync(done, () => expect($(".checklist-statement")).to.have.lengthOf(2));
    });
    checklist.run([
      {
        name: "First rule",
        action: function () {
          this.resolve(true);
        }
      },
      {
        name: "Second rule (ajax)",
        href: window.remoteLocation,
        action: function ($) {
          var flag = $("h1").length === 1;
          this.resolve(flag);
        }
      }
    ]);
  });

});
