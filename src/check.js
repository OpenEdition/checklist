const EventEmitter = require("eventemitter2").EventEmitter2;

function runCheck (check) {
  new Promise(check.action.bind(check)).then(check.resolve, check.reject);
  return check;
}

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
    if (testCheck(this)) {
      runCheck(this);
    }
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
}

module.exports = Check;
