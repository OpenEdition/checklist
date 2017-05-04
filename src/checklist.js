const Base = require("./base.js");
const Batch = require("./batch.js");
const Checker = require("./checker.js");
const Config = require("./config.js");
const Loader = require("./loader.js");
const UI = require("./ui.js");

function initChecklist (checklist) {
  const config = new Config();
  const loader = new Loader();
  Object.assign(checklist, {config, loader});

  const parent = config.get("parent");
  if (parent) {
    const ui = new UI({parent});
    ui.show();
    checklist.ui = ui;
  }
  // TODO: return promise in order to trigger a state when ready
}

class Checklist extends Base {
  constructor () {
    super("Checklist");
    initChecklist(this);
  }

  check (rules = this.config.rules) {
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
      checker.run(rules);
    });
  }

  batch (hrefs) {
    const batch = new Batch(hrefs);
    return batch;
  }

  reset () {
    initChecklist(this);
  }
}

module.exports = Checklist;
