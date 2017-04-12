const EventEmitter = require("eventemitter2").EventEmitter2;
const Check = require("./check.js");

class Checker extends EventEmitter {
  constructor ({ rules, context }) {
    super();
    this.rules = rules;
    this.context = (typeof context === "function" ? context() : context) || [];
    this.statements = [];
  }

  run () {
    const getCheckPromises = (rule) => {
      return new Promise ((resolve, reject) => {
        const check = new Check({
          context: this.context,
          rule
        });
        check.once("done", resolve);
        check.on("statement", (statement) => {
          this.statements.push(statement);
          this.emit("statement", statement);
        });
        check.run();
      });
    };

    const promises = this.rules.map(getCheckPromises);
    Promise.all(promises).then(() => {
      this.emit("done");
    }).catch((err) => {
      throw Error(err);
    });

    return this;
  }
}

module.exports = Checker;
