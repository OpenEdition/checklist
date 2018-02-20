const Base = require("./base.js");
const Checker = require("./checker.js");
const Config = require("./config.js");
const Loader = require("./loader.js");
const UI = require("./ui/ui.js");

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
          });
        }

        // Set ready state
        this.triggerState("ready");
      });
    });
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

  run ({href, rules} = {}) {
    // Wait for the 'ready' event
    if (!this.hasState("ready")) {
      return this.postponePromise("ready", "run", arguments);
    }

    const forwardCheckerEvents = (checker) => {
      const events = [ "check.run", "check.done", "check.success", "check.rejected", "statement.new", "statement.update", "checker.run", "checker.done", "marker"];
      this.forwardEvents(checker, events);
    };

    const setCheckerHandlers = (checker, resolve, reject) => {
      checker.once("run", () => {
        this.emit("checker.run", checker);
      });
      checker.once("done", () => {
        resolve(checker);
        this.emit("checker.done", checker);
      });
      // TODO: handle error
      checker.once("err", (err) => {
        reject(err);
        this.emit("checker.error", err, checker);
      });
      forwardCheckerEvents(checker);
    };

    rules = rules || this.getConfig("rules");
    // TODO: rename context in contextCreator
    const context = this.getConfig("context");
    const ui = this.ui;
    const checker = new Checker({ href, rules, context, caller: this });

    if (ui && ui.hasState("initialized")) {
      checker.whenState("ready").then(() => {
        ui.connectChecker(checker);
      });
    }

    return new Promise((resolve, reject) => {
      setCheckerHandlers(checker, resolve, reject);
      checker.run();
    });
  }
}

module.exports = Checklist;
