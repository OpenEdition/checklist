const Base = require("./base.js");
const Batch = require("./batch.js");
const Checker = require("./checker.js");
const Config = require("./config.js");
const Loader = require("./loader.js");
const UI = require("./ui.js");

function initComponents (checklist) {
  function setChecklistProperty (checklist, component) {
    const name = component.classname.toLowerCase();
    checklist[name] = component;
  }

  function getComponentPromise (componentClass) {
    return new Promise((resolve, reject) => {
      const component = new componentClass({caller: checklist});
      component.whenState("ready")
      .then(() => {
        setChecklistProperty(checklist, component);
        resolve(component);
      });
    });
  }

  const componentClasses = [Config, Loader, UI];
  const promises = componentClasses.map(getComponentPromise);
  return Promise.all(promises);
}

function initChecklist (checklist, userConfig) {
  return initComponents(checklist)
  .then(() => {
    userConfig = userConfig || checklist.userConfig;
    checklist.config.extend(userConfig);

    const parent = checklist.config.get("parent");
    if (parent) {
      checklist.ui.attach(parent);
    }

    checklist.triggerState("ready");
  });
}

function forwardCheckerEvents (checklist, checker) {
  const events = [ "check.done", "check.success", "check.rejected", "statement.new", "statement.update", "checker.done"];
  checklist.forwardEvents(checker, events);
}

class Checklist extends Base {
  constructor (userConfig) {
    super("Checklist");
    this.userConfig = userConfig;
    initChecklist(this, userConfig);
  }

  // TODO: put rules in the config (like context)
  run (rules) {
    // Wait for the 'ready' event
    if (!this.hasState("ready")) {
      return this.postponePromise("ready", "run", arguments);
    }

    const setCheckerHandlers = (checker, resolve, reject) => {
      checker.once("done", () => {
        resolve(checker);
        this.emit("checker.done", checker);
      });
      // TODO: handle error
      checker.once("err", (err) => {
        reject(err);
        this.emit("checker.error", err, checker);
      });
      forwardCheckerEvents(this, checker);
    };

    // TODO: rename context in contextCreator
    const context = this.config.get("context");
    const ui = this.ui;
    const checker = new Checker({ rules, context, caller: this });
    if (ui.hasState("attached")) {
      checker.once("done", (checker) => {
        const statements = checker.statements;
        ui.inject(statements);
        // TODO: doc + move test in Events
        this.emit("injected", statements);
      });
    }
    return new Promise((resolve, reject) => {
      setCheckerHandlers(checker, resolve, reject);
      checker.run();
    });
  }

  // TODO: put rules in the config (like context)
  runBatch (locations, rules) {
    // Wait for the 'ready' event
    if (!this.hasState("ready")) {
      return this.postponePromise("ready", "runBatch", arguments);
    }
    const context = this.config.get("context");
    const batch = new Batch({ rules, context, locations, caller: this });
    forwardCheckerEvents(this, batch);
    return batch.run().then((batch) => {
      this.emit("batch.done", batch);
      return batch;
    });
  }

  reset (userConfig) {
    return initChecklist(this, userConfig);
  }
}

module.exports = Checklist;
