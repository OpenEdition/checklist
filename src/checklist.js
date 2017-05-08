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
      const component = new componentClass();
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

class Checklist extends Base {
  constructor (userConfig) {
    super("Checklist");
    this.userConfig = userConfig;
    initChecklist(this, userConfig);
  }

  run (rules) {
    // Wait for the 'ready' event
    if (!this.hasState("ready")) {
      const fn = this.run.apply(this, arguments);
      return this.once("ready", fn);
    }

    const transferEvents = (checker) => {
      const transferableEvents = [ "check-done", "check-success", "check-rejected", "statement", "duplicate"];
      const isTransferableEvent = (eventName) => transferableEvents.includes(eventName);
      checker.onAny((eventName, ...values) => {
        if (isTransferableEvent(eventName)) {
          this.emit(eventName, ...values);
        }
      });
    };

    const setCheckerHandlers = (checker, resolve, reject) => {
      checker.once("done", () => {
        resolve(checker);
        this.emit("checker-done", checker);
      });
      // TODO: handle error
      checker.once("err", (err) => {
        reject(err);
        this.emit("checker-error", err, checker);
      });
      transferEvents(checker);
    };

    // TODO: rename context in contextCreator
    const {context, ui} = this;
    const checker = new Checker({ rules, context });
    if (ui) {
      checker.once("done", (statements) => ui.inject(statements));
    }
    return new Promise((resolve, reject) => {
      setCheckerHandlers(checker, resolve, reject);
      checker.run();
    });
  }

  runBatch (hrefs) {
    // Wait for the 'ready' event
    if (!this.hasState("ready")) {
      const fn = this.runBatch.apply(this, arguments);
      return this.once("ready", fn);
    }

    const batch = new Batch(hrefs);
    return batch;
  }

  reset (userConfig) {
    return initChecklist(this, userConfig);
  }
}

module.exports = Checklist;
