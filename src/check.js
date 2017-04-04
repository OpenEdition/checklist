const EventEmitter = require("eventemitter2").EventEmitter2;

function runCheck (check) {
  new Promise(check.action.bind(check)).then(check.resolve, check.reject);
  return check;
}

function testCheck (check) {
  if (typeof check.condition === "function") {
    return check.condition();
  }
  return true;
}

class Check extends EventEmitter {
  constructor ({ rule }) {
    super();
    this.action = rule.action;
    this.condition = rule.condition;
    if (testCheck(this)) {
      runCheck(this);
    }
  }

  reject (err) {
    this.emit("error", err);
  }

  resolve (value) {
    this.notification = value; // TODO: new Notification()
    this.emit("done", value);
  }
}

module.exports = Check;
