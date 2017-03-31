const EventEmitter = require("eventemitter2").EventEmitter2;

function runCheck (check) {
  const onFulfilled = (res) => {
    check.notification = res; // TODO: new Notification()
    check.emit("done", res);
  };
  const onRejected = (err) => {
    check.emit("error", err);
  };
  new Promise(check.action).then(onFulfilled, onRejected);
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
}

module.exports = Check;
