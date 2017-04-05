const EventEmitter = require("eventemitter2").EventEmitter2;
const Statement = require("./statement.js");

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
    this.statements = [];
    this.active = false;
  }

  notify (value) {
    const statement = new Statement(value);
    this.statements.push(statement);
    this.emit("statement", statement);
    return this;
  }

  reject (err) {
    this.emit("error", err);
    return this;
  }

  resolve (value) {
    if (value) {
      this.notify(value);
    }
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
