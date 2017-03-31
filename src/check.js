const EventEmitter = require("eventemitter2").EventEmitter2;

class Check extends EventEmitter {
  constructor ({ rule }) {
    super();
    this.action = rule.action;
    this.condition = rule.condition;
    if (this.test()) {
      this.run();
    }
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

module.exports = Check;
