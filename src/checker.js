const EventEmitter = require("eventemitter2").EventEmitter2;

class Check extends EventEmitter {
  constructor ({ rule }) {
    super();
    this.action = rule.action;
    this.condition = rule.condition;
  }

  run () {
    const onFulfilled = (res) => {
      this.notification = res; // TODO: new Notification()
      this.emit("done", res);
    };
    const onRejected = (err) => {
      this.emit("error", err);
    };
    new Promise(this.action).then(onFulfilled, onRejected);
    return this;
  }

  test () {
    if (typeof this.condition === "function") {
      return this.condition();
    }
    return true;
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
        // TODO: inclure ceci dans le constructeur de Check
        if (check.test()) {
          check.once("done", resolve);
          check.once("error", reject);
          check.run();
        }
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
