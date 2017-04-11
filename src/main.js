const UI = require("./ui.js");
const Checker = require("./checker.js");

window.checklist = {
  run: function (config) {
    if (typeof jQuery === "undefined") {
      throw Error ("Checklist requires jQuery");
    }

    if (config) {
      this.setConfig(config);
    }
    const {rules, context, parent} = this.config;

    // UI
    const ui = new UI({parent});
    ui.show();

    // Checker
    const checker = new Checker({ rules, context });
    checker.on("done", () => {
      ui.inject(checker.statements);
    });
    checker.run();
  },

  // TODO: 1. merge config, 2. add an "override" parameter
  setConfig: function ({rules, context, parent = "#container"}) {
    this.config = {rules, context, parent};
  }
};
