const Base = require("./base.js");
const Batch = require("./batch.js");
const Checker = require("./checker.js");
const Config = require("./config.js");
const Loader = require("./loader.js");
const UI = require("./ui.js");

function initComponents (checklist) {
  function getComponentPromise (componentClass) {
    return new Promise((resolve, reject) => {
      const component = new componentClass({caller: checklist});
      const componentName = component.classname.toLowerCase();
      component.whenState("ready")
      .then(() => {
        checklist[componentName] = component;
        checklist.emit(`${componentName}.ready`, component);
        resolve(component);
      });
    });
  }

  const componentClasses = [Config, Loader, UI];
  const promises = componentClasses.map(getComponentPromise);
  return Promise.all(promises);
}

function initChecklist (checklist, userConfig) {
  const injectStyles = (function () {
    const $styleTag = $("<style>").appendTo("head");
    return function (styles) {
      if (styles == null) return;
      $styleTag.html(styles);
    };
  })();

  // Inject custom styles
  const customStyles = userConfig && userConfig.customStyles;
  injectStyles(customStyles);

  // Init components
  return initComponents(checklist)
  .then(() => {
    userConfig = userConfig || checklist.userConfig;
    checklist.config.extend(userConfig);

    const parent = checklist.config.get("parent");
    if (parent) {
      const ui = checklist.ui;
      ui.init(parent);
      checklist.forwardEvents(ui, [{"injected.statement": "ui.injected.statement"}, {"injected.statements": "ui.injected.statements"}]);
    }

    checklist.triggerState("ready");
  });
}

function forwardCheckerEvents (checklist, checker) {
  const events = [ "check.done", "check.success", "check.rejected", "statement.new", "statement.update", "checker.done"];
  checklist.forwardEvents(checker, events);
}

function connectCheckerToUi (checker, ui) {
  checker.whenState("ready").then(() => {
    ui.connectChecker(checker);
  });
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

    if (ui.hasState("initialized")) {
      connectCheckerToUi(checker, ui);
    }

    return new Promise((resolve, reject) => {
      setCheckerHandlers(checker, resolve, reject);
      checker.run();
    });
  }

  // TODO: put rules in the config (like context)
  runBatch (hrefs, rules) {
    // Wait for the 'ready' event
    if (!this.hasState("ready")) {
      return this.postponePromise("ready", "runBatch", arguments);
    }
    const context = this.config.get("context");
    const batch = new Batch({ rules, context, hrefs, caller: this });
    forwardCheckerEvents(this, batch);

    const ui = this.ui;
    if (ui.hasState("initialized")) {
      batch.on("ready", () => {
        batch.checkers.forEach((checker) => {
          connectCheckerToUi(checker, ui);
        });
      });
    }

    return batch.run().then((batch) => {
      this.emit("batch.done", batch);
      return batch;
    });
  }

  runBatchFromToc (rules) {
    const toc = this.config.get("toc");
    const ui = this.ui;
    if (ui.hasState("initialized")) {
      ui.copyToc(toc);
    }

    const hrefs = toc.map((entry) => {
      return entry.href;
    });
    return this.runBatch(hrefs, rules);
  }

  reset (userConfig) {
    return initChecklist(this, userConfig);
  }
}

module.exports = Checklist;
