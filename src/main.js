const Checker = require("./checker.js");
const Loader = require("./loader.js");
const UI = require("./ui.js");

if (typeof jQuery === "undefined") {
  throw Error ("Checklist requires jQuery");
}

window.checklist = {
  // checklist properties
  config: window.checklistUserConfig || {},

  // checklist methods
  // TODO: 1. merge config, 2. add an "override" parameter
  setConfig: function (options) {
    const config = {};
    config.context = options.context || this.config.context;
    config.rules = options.rules || this.config.rules;
    config.parent = options.parent || this.config.parent;
    this.config = config;
  },

  init: function (config) {
    if (config) {
      this.setConfig(config);
    }

    const {rules, context, parent} = this.config;

    // TODO: provide a way to reset Loader
    if (!this.loader) {
      this.loader = new Loader();
    }

    const checker = new Checker({ rules, context });
    this.checker = checker;

    // Init optional UI
    if (parent) {
      if (!this.ui) {
        this.ui = new UI({parent});
        this.ui.show();
      }
      checker.on("done", (statements) => {
        this.ui.inject(statements);
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
    this.config = {};
  }
};
