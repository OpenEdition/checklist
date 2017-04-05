const EventEmitter = require("eventemitter2").EventEmitter2;

// Eval a condition defined as a string
function evalStringCondition (condition, context) {
  // Replace context keys by their values in string (false if undefined)
  function replaceAttributes (condition, context) {
    const regex = /\b[^!&|()]*\b/g;
    return condition.replace(regex, (key) => {
      if (key.trim().length === 0) return key;
      return typeof context[key] !== "undefined" ? context[key] : false;
    });
  }

  const conditionToEval = replaceAttributes(condition, context);
  // No worry, eval is safe here
  // jshint evil: true
  return eval(conditionToEval);
}

function testCheck (check) {
  const context = check.checker.context;
  if (typeof check.condition === "function") {
    return check.condition(context);
  } else if (typeof check.condition === "string") {
    return evalStringCondition(check.condition, context);
  }
  return true;
}

class Check extends EventEmitter {
  constructor ({ checker, rule }) {
    super();
    this.checker = checker;
    this.action = rule.action;
    this.condition = rule.condition;
    this.active = false;
  }

  reject (err) {
    this.emit("error", err);
    return this;
  }

  resolve (value) {
    this.notification = value; // TODO: new Notification()
    this.emit("done", value);
    return this;
  }

  run () {
    if (!this.active && testCheck(this)) {
      this.active = true;
      new Promise(this.action.bind(this)).then(this.resolve, this.reject);
      return this;
    }
  }
}

module.exports = Check;
