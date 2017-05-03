const Base = require("./base.js");
const Check = require("./check.js");

function getContext (source, contextCreator) {
  if (typeof contextCreator === "object") {
    return contextCreator;
  }
  const selectFunc = source.get$();
  return contextCreator(selectFunc);
}

class Checker extends Base {
  constructor ({ rules = [], context = [], source }) {
    super("Checker");

    const loader = window.checklist.loader;
    this.source = source || loader.getSelfSource();
    // TODO: rename context in constructor (contextCreator?)
    this.context = getContext(this.source, context);
    this.rules = rules;
    this.statements = [];
    this.rejections = [];
  }

  // FIXME: update this.rules by merging rules when running this.run(rules) (but this must be optionnal). NOTE: this.statements is already updated
  run (rules) {
    const currentStatements = [];

    const getRules = (rules) => {
      if (rules instanceof Array) {
        return rules;
      } else if (typeof rules === "object") {
        if (rules.rules) {
          throw Error("Checker.run() parameter must be rules (not a config object)");
        }
        return [rules];
      }
      return this.rules;
    };

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
        // FIXME: should also use currentRejections (like currentStatements) for using with checker.run()?..... or maybe API is bad and we should create a new Checker each time new tests are runned.
        // FIXME: maybe error should be a simple message instead of an Error()
        this.rejections.push({check, error});
        this.emit("check-rejected", error, check);
      });
      check.on("statement", (statement) => {
        currentStatements.push(statement);
        this.statements.push(statement);
        this.emit("statement", statement);
      });
      check.on("duplicate", (statement) => {
        // FIXME: what about currentStatement here?
        // TODO: document this event
        this.emit("duplicate", statement);
      });
    };

    rules = getRules(rules);
    const promises = rules.map(getCheckPromises);
    Promise.all(promises).then(() => {
      this.emit("done", currentStatements);
    }).catch((err) => {
      // TODO: error handling ok ?
      throw Error(err);
    });

    return this;
  }
}

module.exports = Checker;
