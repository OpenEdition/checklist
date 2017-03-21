const EventEmitter = require("eventemitter2").EventEmitter2;

class Check extends EventEmitter {
  constructor ({ rule }) {
    super();
    this.action = rule.action;
  }

  run () {
    // TODO: passer les parametres à action()
    new Promise(this.action)
      .then(() => this.emit("done"))
      .catch(() => this.emit("error")); // TODO: passer l'erreur en param
    return this;
  }
}

class Checker extends EventEmitter {
  constructor ({ rules }) {
    super();
    this.rules = rules;
  }

  run () {
    const getCheckPromises = (rule) => {
      return new Promise ((resolve, reject) => {
        const check = new Check({ rule });
        check.once("done", resolve);
        check.once("error", reject);
        check.run();
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
