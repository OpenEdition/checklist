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
}

module.exports = Batch;
