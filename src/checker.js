const EventEmitter = require("eventemitter2").EventEmitter2;
const Check = require("./check.js");

class Checker extends EventEmitter {
  constructor ({ rules, context }) {
    super();
    this.rules = rules;
    this.context = (typeof context === "function" ? context() : context) || [];
  }

  run () {
    const getCheckPromises = (rule) => {
      return new Promise ((resolve, reject) => {
        const check = new Check({
          checker: this,
          rule 
        });
        check.once("done", resolve);
        check.once("error", reject);
      });
    };

    const promises = this.rules.map(getCheckPromises);
    Promise.all(promises).then(() => {
      this.emit("done");
    });

    return this;
  }
}

module.exports = Checker;
