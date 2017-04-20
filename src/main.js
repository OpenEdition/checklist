const UI = require("./ui.js");
const Checker = require("./checker.js");

if (typeof jQuery === "undefined") {
  throw Error ("Checklist requires jQuery");
}

window.checklist = {
  // Expose high level classes
  Checker,
  UI,

  // checklist methods
  // TODO: 1. merge config, 2. add an "override" parameter
  setConfig: function ({rules, context, parent, callback}) {
    this.config = {rules, context, parent, callback};
  },

  init: function (config) {
    if (config) {
      this.setConfig(config);
    }

    const {rules, context, parent} = this.config;
    const checker = new Checker({ rules, context });
    this.checker = checker;

    // Init optional UI
    if (parent) {
      const ui = new UI({parent});
      ui.show();
      checker.on("done", (statements) => {
        ui.inject(statements);
      });
    }

    return checker;
  },

  start: function (config, callback) {
    const checker = this.init(config);

    if (typeof callback === "function") {
      checker.on("done", (statements) => {
        callback(checker, statements);
      });
    }

    checker.run();
    return checker;
  },

  clear: function () {
    this.setConfig({});
  }
};
