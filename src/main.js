const UI = require("./ui.js");
const Checker = require("./checker.js");

window.checklist = {
  // Expose high level classes
  Checker,
  UI,

  // checklist methods
  start: function (config) {
    if (typeof jQuery === "undefined") {
      throw Error ("Checklist requires jQuery");
    }

    if (config) {
      this.setConfig(config);
    }
    const {rules, context, parent} = this.config;

    const checker = new Checker({ rules, context });

    // Init optional UI
    if (parent !== false) {
      const ui = new UI({parent});
      ui.show();
      checker.on("done", (statements) => {
        ui.inject(statements);
      });
    }

    checker.run();
    return checker;
  },

  // TODO: 1. merge config, 2. add an "override" parameter
  setConfig: function ({rules, context, parent = "#container"}) {
    this.config = {rules, context, parent};
  }
};
