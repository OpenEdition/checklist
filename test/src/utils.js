window.expect = window.chai.expect;

window.expectAsync = function (done, expectation) {
  try {
    expectation();
  } catch (err) {
    return done(err);
  }
  done();
};
