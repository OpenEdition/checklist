const Base = require("./base.js");
const Batch = require("./batch.js");
const Checker = require("./checker.js");
const Loader = require("./loader.js");
const UI = require("./ui.js");

class Checklist extends Base {
  constructor (userConfig) {
    super("Checklist");
    this.createConfig(userConfig);
  }

  createConfig (config) {
    this.config = {};
    this.setConfig(config);
  }

  createLoader (force = false) {
    if (this.loader && !force) return;
    this.loader = new Loader();
    // TODO: return promise
  }

  // FIXME: missing parent
  createUi (force = false) {
    if (this.ui && !force) return;
    this.ui = new UI({parent})
      .show();
    // TODO: return promise
  }

  check (rules = this.config.rules) {
    // TODO: rename context in contextCreator
    const {context, ui} = this;
    const checker = new Checker({ rules, context });
    if (ui) {
      checker.on("done", (statements) => ui.inject(statements));
    }
    return new Promise((resolve, reject) => {
      checker.on("done", () => resolve(checker));
      // TODO: handle error
      // checker.on("err", () => reject());
      checker.run();
    });
  }

  // TODO: 1. merge config, 2. add an "override" parameter
  setConfig (options) {
    if (!options) return;
    const config = {};
    config.context = options.context || this.config.context;
    config.rules = options.rules || this.config.rules;
    config.parent = options.parent || this.config.parent;
    this.config = config;
    return this;
  }

  clear () {
    this.config = {};
    this.createLoader(true);
    // TODO: Ui ?
  }

  batch (hrefs) {
    const batch = new Batch(hrefs);
    return batch;
  }
}

module.exports = Checklist;
