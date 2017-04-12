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
    const {rules, context, parent, ui} = this.config;

    const checker = new Checker({ rules, context });

    // Init optional UI
    if (ui === true) {
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
  setConfig: function ({rules, context, parent = "#container", ui = true}) {
    this.config = {rules, context, parent, ui};
  }
};
