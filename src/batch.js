const Base = require("./base.js");
const Checker = require("./checker.js");

// TODO: remove possible duplicates in sources/hrefs
function getCheckers (batch) {

  function getCheckerPromise (checkerOptions) {
    const promise = new Promise((resolve, reject) => {
      const checker = new Checker(checkerOptions);
      checker.whenState("ready").then(() => resolve(checker));
    });
    return promise;
  }

  function getCheckerAllPromises (hrefs, checkerOptions) {
    const promises = hrefs.map((href) => {
      checkerOptions.href = href;
      return getCheckerPromise(checkerOptions);
    });
    return promises;
  }

  const {rules, context, hrefs} = batch;
  const checkerOptions = {rules, context, caller: batch};
  const promises = getCheckerAllPromises(hrefs, checkerOptions);

  // TODO: err
  return Promise.all(promises);
}

class Batch extends Base {
  constructor ({ rules = [], context = [], hrefs = [], caller }) {
    super("Batch", caller);

    Object.assign(this, { rules, context, hrefs });

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
      const eventsToForward = ["check.done", "check.success", "check.rejected", "statement.new", "statement.update", {"done": "checker.done"}];
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
