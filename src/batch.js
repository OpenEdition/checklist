const Base = require("./base.js");
const Checker = require("./checker.js");

class Batch extends Base {
  constructor ({rules = [], context = [], locations = []}) {
    super("Batch");
    this.locations = locations;
  }

  init () {
    // TODO: remove possible duplicates in sources/locations
    const {rules, context, locations} = this;
    const promises = locations.map((location) => {
      return new Promise((resolve, reject) => {
        const checker = new Checker({rules, context, location});
        checker.whenState("ready").then(() => resolve(checker));
      });
    });

    return Promise.all(promises).then((checkers) => {
      this.checkers = checkers;
      this.triggerState("ready");
    }).catch((err) => {
      // TODO: error handling ok ?
      throw Error(err);
    });
  }

  run () {
    const checkers = this.checkers;
    if (!checkers || checkers.length === 0) {
      return Promise.reject("No checkers defined in Batch");
    }

    const promises = checkers.map((checker) => {
      const eventsToForward = ["check-done", "check-success", "check-rejected", "statement", "duplicate"];
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
