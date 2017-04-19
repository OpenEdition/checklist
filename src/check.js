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
  const context = check.context;
  if (typeof check.condition === "function") {
    return check.condition(context);
  } else if (typeof check.condition === "string") {
    return evalStringCondition(check.condition, context);
  }
  return true;
}

class Check extends EventEmitter {
  constructor ({ context, rule }) {
    super();
    this.context = context;
    this.name = rule.name;
    this.action = rule.action;
    this.condition = rule.condition;
    this.statements = [];
    // states: 0 = not started yet, 1 = ongoing, 2 = done
    this.state = 0;
  }

  notify (value) {
    const statement = new Statement({check: this, infos: value});

    // Increase count if this statement already exists in Check
    const duplicate = statement.getDuplicate();
    if (duplicate) {
      duplicate.add();
    } else {
      // Otherwise register it in Check
      this.statements.push(statement);
      this.emit("statement", statement);
    }
    return this;
  }

  // TODO: Check exception should not raise errors. Use resolve with a specific attribute instead.
  reject (err) {
    throw Error(err);
  }

  resolve (value) {
    if (this.state > 1) return this;
    this.state = 2;
    if (value) {
      this.notify(value);
    }
    this.emit("done");
    return this;
  }

  run () {
    if (this.state < 1 && testCheck(this)) {
      // TODO: move delay in config
      const delay = 1000;
      this.state = 1;
      setTimeout(this.resolve.bind(this), delay);
      this.action.call(this);
      return this;
    }
  }
}

module.exports = Check;
