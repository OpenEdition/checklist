const Base = require("./base.js");
const Checker = require("./checker.js");
const Config = require("./config.js");
const Loader = require("./loader.js");
const UI = require("./ui/ui.js");

function forwardCheckerEvents(checklist, checker) {
  const events = [ {"run": "checker.run"},
  {"done": "checker.done"}, {"error": "checker.error"}, "check.run", "check.done", "check.success", "check.rejected", "check.dropped", "statement.new", "statement.update", "marker"];
  checklist.forwardEvents(checker, events);
}

class Checklist extends Base {
  constructor (userConfig) {
    super("Checklist");
    this.userConfig = userConfig;
  }

  init (siteConfig) {
    // Clear previous properties first
    this.clear();

    // Init components
    // Init Config first
    this.config = new Config({caller: this});
    return this.config.whenState("ready").then(() => {
      const userConfig = this.userConfig;
      this.config.extend(siteConfig, userConfig);

      // ...then init Loader
      this.loader = new Loader({caller: this});
      return this.loader.whenState("ready").then(() => {

        // Init UI if parent is defined
        const parent = this.getConfig("parent");
        if (parent) {
          this.ui = new UI({caller: this});
          this.ui.whenState("ready").then(() => {
            this.ui.init({parent});
            const events = [ {beforeAction : "ui.beforeAction"}, {afterAction: "ui.afterAction"}];
            this.forwardEvents(this.ui, events);
          })
          .catch(console.error);
        }

        // Set ready state
        this.triggerState("ready");
      })
      .catch(console.error);
    })
    .catch(console.error);
  }

  clear () {
    Object.keys(this).forEach((propName) => {
      const prop = this[propName];
      if (typeof prop === "function") return;
      this[prop] = undefined;
    });
    this.clearStates();
    this.removeAllListeners();
    return this;
  }

  run ({docId, href, rules, context, reloadSource} = {}) {
    // Wait for the 'ready' event
    if (!this.hasState("ready")) {
      return this.postponePromise("ready", "run", arguments);
    }

    docId = docId || this.getConfig("docId");
    rules = rules || this.getConfig("rules");

    const contextCreator = context || this.getConfig("context");
    const ui = this.ui;

    if (reloadSource === true) {
      this.loader.removeSource(href);
    }

    const checker = new Checker({ docId, href, rules, contextCreator, caller: this });

    if (ui && ui.hasState("initialized")) {
      checker.whenState("ready").then(() => {
        ui.connectChecker(checker);
      })
      .catch(console.error);
    }

    forwardCheckerEvents(this, checker);
    return checker.run();
  }

  runBatch({docs = [], rules, context, reloadSources}) {
    // Wait for the 'ready' event
    if (!this.hasState("ready")) {
      return this.postponePromise("ready", "run", arguments);
    }

    if (reloadSources) {
      this.loader.clear();
    }

    rules = rules || this.getConfig("rules");
    const defaultContext = context || this.getConfig("context");

    const proms = docs.map(({ docId, href, context = defaultContext }) => {
      const checker = new Checker({ docId, href, rules, contextCreator: context, caller: this });
      forwardCheckerEvents(this, checker);
      return checker.run().catch((error) => ({ error, docId, href }));
    });

    return Promise.all(proms);
  }
}

module.exports = Checklist;
