const Base = require("./base.js");
const Check = require("./check.js");
const utils = require("./utils.js");

function getContext (source, contextCreator) {
  if (typeof contextCreator === "object") {
    return contextCreator;
  }
  const selectFunc = source.get$();
  const bodyClasses = source.bodyClasses;
  return contextCreator(selectFunc, bodyClasses);
}

function getRules (rules) {
  if (Array.isArray(rules)) {
    return rules;
  }
  if (rules.rules) {
    throw Error("Checker.run() parameter must be rules (not a config object)");
  }
  return [rules];
}

class Checker extends Base {
  constructor ({ rules = [], context = [], href, caller }) {
    super("Checker", caller);

    this.rules = getRules(rules);
    this.checks = [];

    const loader = window.checklist.loader;
    loader.requestSource(href)
    .then((source) => {
      this.source = source;
      this.docId = utils.getDocIdFromPathname(source.url.pathname);
      // TODO: rename context in constructor (contextCreator?)
      this.context = getContext(source, context);
      this.triggerState("ready");
    });
  }

  run () {
    // Wait for the 'ready' event
    if (!this.hasState("ready")) {
      return this.postponePromise("ready", "run", arguments);
    }

    this.triggerState("run");

    const getCheckPromises = (rule) => {
      return new Promise ((resolve, reject) => {
        const check = new Check({
          context: this.context,
          docId: this.docId,
          source: this.source,
          rule,
          caller: this
        });
        initEvents(check, resolve, reject);
        this.checks.push(check);
        check.run();
      });
    };

    const initEvents = (check, resolve, reject) => {
      // Forward events
      this.forwardEvents(check, [
        {"run": "check.run"},
        {"done": "check.done"},
        {"success": "check.success"},
        {"rejected": "check.rejected"},
        "statement.new",
        "statement.update",
        "marker"
      ]);
      // Resolve
      check.once("done", () => resolve());
    };

    const promises = this.rules.map(getCheckPromises);
    return Promise.all(promises).then(() => {
      this.triggerState("done", this);
    }).catch((err) => {
      // TODO: error handling ok ?
      throw Error(err);
    });
  }

  getStatements () {
    return this.checks.reduce((accumulator, check) => {
      return accumulator.concat(check.statements);
    }, []);
  }

  // Export instance to a minimal plain object which can be stored in cache
  export () {
    const clone = Base.export(this, ["context", "docId", "states"], true);
    clone.checks = this.checks.map((check) => check.export());
    return clone;
  }
}

module.exports = Checker;
