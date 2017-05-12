const Base = require("./base.js");
const Checker = require("./checker.js");

// TODO: remove possible duplicates in sources/locations
function getCheckers (batch) {

  function getCheckerPromise (checkerOptions) {
    const promise = new Promise((resolve, reject) => {
      const checker = new Checker(checkerOptions);
      checker.whenState("ready").then(() => resolve(checker));
    });
    return promise;
  }

  function getCheckerAllPromises (checkerOptions) {
    const promises = locations.map((location) => {
      return getCheckerPromise(checkerOptions);
    });
    return promises;
  }

  const {rules, context, locations} = batch;
  const checkerOptions = {rules, context, locations, caller: batch};
  const promises = getCheckerAllPromises(checkerOptions);

  // TODO: err
  return Promise.all(promises);
}

class Batch extends Base {
  constructor ({ rules = [], context = [], locations = [], caller }) {
    super("Batch", caller);

    Object.assign(this, { rules, context, locations });

    getCheckers(this)
    .then((checkers) => {
      this.checkers = checkers;
      this.triggerState("ready");
    });
  }

  run () {
    // Wait for the 'ready' event
    if (!this.hasState("ready")) {
      return this.postponePromise("ready", "run", arguments);
    }

    const checkers = this.checkers;
    if (!checkers || checkers.length === 0) {
      return Promise.reject("No checkers defined in Batch");
    }

    const promises = checkers.map((checker) => {
      const eventsToForward = ["check.done", "check.success", "check.rejected", "statement", "duplicate", {"done": "checker.done"}];
      this.forwardEvents(checker, eventsToForward);
      return checker.run();
    });

    return Promise.all(promises).then((checkers) => {
      this.triggerState("done");
      return this;
    }).catch((err) => {
      // TODO: error handling ok ?
      throw Error(err);
    });
  }
}

module.exports = Batch;
