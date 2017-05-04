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

class Checklist extends Base {
  constructor () {
    super("Checklist");
    initComponents(this)
    .then(() => {
      this.triggerState("ready");
    });
  }

  check (rules) {
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

  batch (hrefs) {
    const batch = new Batch(hrefs);
    return batch;
  }

  reset () {
    initComponents(this);
  }
}

module.exports = Checklist;
