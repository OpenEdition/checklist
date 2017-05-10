const Base = require("./base.js");
const Check = require("./check.js");

function getContext (source, contextCreator) {
  if (typeof contextCreator === "object") {
    return contextCreator;
  }
  const selectFunc = source.get$();
  return contextCreator(selectFunc);
}

function getRules (rules) {
  if (rules instanceof Array) {
    return rules;
  }
  if (rules.rules) {
    throw Error("Checker.run() parameter must be rules (not a config object)");
  }
  return [rules];
}

class Checker extends Base {
  constructor ({ rules = [], context = [], location }) {
    super("Checker");

    this.rules = getRules(rules);
    this.statements = [];
    this.rejections = [];

    const loader = window.checklist.loader;
    loader.requestSource(location)
    .then((source) => {
      this.source = source;
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

    const getCheckPromises = (rule) => {
      return new Promise ((resolve, reject) => {
        const check = new Check({
          context: this.context,
          rule
        });
        initEvents(check, resolve, reject);
        check.run();
      });
    };

    const initEvents = (check, resolve, reject) => {
      check.once("done", () => {
        resolve();
        this.emit("check-done", check);
      });
      check.on("success", () => this.emit("check-success", check));
      check.on("rejected", (error) => {
        // FIXME: maybe error should be a simple message instead of an Error()
        this.rejections.push({check, error});
        this.emit("check-rejected", error, check);
      });
      check.on("statement", (statement) => {
        this.statements.push(statement);
        this.emit("statement", statement);
      });
      check.on("duplicate", (statement) => {
        // TODO: document this event
        this.emit("duplicate", statement);
      });
    };

    const promises = this.rules.map(getCheckPromises);
    return Promise.all(promises).then(() => {
      this.emit("done", this.statements);
    }).catch((err) => {
      // TODO: error handling ok ?
      throw Error(err);
    });
  }
}

module.exports = Checker;
