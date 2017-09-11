const Base = require("./base.js");
const Checker = require("./checker.js");
const Config = require("./config.js");
const Loader = require("./loader.js");
const UI = require("./ui/ui.js");

function initComponents (checklist) {
  function getComponentPromise (componentClass) {
    return new Promise((resolve, reject) => {
      const component = new componentClass({caller: checklist});
      const componentName = component.classname.toLowerCase();
      component.whenState("ready")
      .then(() => {
        checklist[componentName] = component;
        resolve(component);
      });
    });
  }

  const componentClasses = [Config, Loader, UI];
  const promises = componentClasses.map(getComponentPromise);
  return Promise.all(promises);
}

function initUi (checklist, parent) {
  const ui = checklist.ui;
  const buttonsCreator = checklist.config.get("buttonsCreator");
  const toc = checklist.config.get("toc");
  ui.init({parent, buttonsCreator, toc});
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
  }

  init (siteConfig) {
    const injectStyles = (function () {
      const $styleTag = $("<style>").appendTo("head");
      return function (styles) {
        if (styles == null) return;
        $styleTag.html(styles);
      };
    })();

    // Clear previous properties first
    this.clear();

    // Init components
    return initComponents(this)
    .then(() => {
      const userConfig = this.userConfig;
      this.config.extend(siteConfig, userConfig);

      // Inject custom styles
      const customStyles = this.config.get("customStyles");
      injectStyles(customStyles);

      // Init UI if parent is defined
      const parent = this.config.get("parent");
      if (parent) {
        initUi(this, parent);
      }

      this.triggerState("ready");
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

    rules = rules || this.config.get("rules");
    // TODO: rename context in contextCreator
    const context = this.config.get("context");
    const ui = this.ui;
    const checker = new Checker({ href, rules, context, caller: this });

    if (ui.hasState("initialized")) {
      connectCheckerToUi(checker, ui);
    }

    return new Promise((resolve, reject) => {
      setCheckerHandlers(checker, resolve, reject);
      checker.run();
    });
  }
}

module.exports = Checklist;
