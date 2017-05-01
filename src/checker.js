const Base = require("./base.js");
const Check = require("./check.js");

class Checker extends Base {
  constructor ({ rules, context }) {
    super("Checker");
    
    this.rules = rules || [];
    this.context = (typeof context === "function" ? context() : context) || [];
    this.statements = [];
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
        check.once("done", () => {
          resolve();
          this.emit("check-done", check);
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
        check.run();
      });
    };

    rules = getRules(rules);
    const promises = rules.map(getCheckPromises);
    Promise.all(promises).then(() => {
      this.emit("done", currentStatements);
    }).catch((err) => {
      throw Error(err);
    });

    return this;
  }
}

module.exports = Checker;
