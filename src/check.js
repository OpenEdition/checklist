const Base = require("./base.js");
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

function setDone (check) {
  if (check.hasState("done")) return;
  check.triggerState("done", check);
}

class Check extends Base {
  constructor ({ context, rule, caller }) {
    super("Check", caller);

    Object.assign(this, rule);
    this.context = context;
    this.statements = [];

    const getSource = () => {
      const loader = window.checklist.loader;
      loader.requestSource(this.href)
        .then((source) => {
          this.source = source;
          this.triggerState("ready");
        }).catch((msg) => {
          this.reject(msg);
        });
    };
    getSource();
  }

  notify (value) {
    const statement = new Statement({check: this, infos: value, caller: this});

    // Increase count if this statement already exists in Check
    const duplicate = statement.getDuplicate();
    if (duplicate) {
      duplicate.add();
      // TODO: review event names
      this.emit("duplicate", duplicate);
    } else {
      // Otherwise register it in Check
      this.statements.push(statement);
      this.emit("statement", statement);
    }
    return this;
  }

  reject (errMsg) {
    if (this.hasState("done") || this.hasState("rejected")) return this;
    const err = Error(errMsg);
    this.triggerState("rejected", err, this);
    setDone(this);
    return this;
  }

  resolve (value) {
    if (this.hasState("done") || this.hasState("success")) return this;
    if (value) {
      this.notify(value);
    }
    this.triggerState("success", this);
    setDone(this);
    return this;
  }

  run () {
    // Wait for source to be ready
    if (!this.hasState("ready")) {
      this.once("ready", this.run);
      return this;
    }

    if (!this.test()) {
      this.resolve();
      return this;
    }

    if (!this.hasState("started")) {
      // TODO: move delay in config
      const delay = 1000;
      this.triggerState("started");
      setTimeout(this.resolve.bind(this), delay);
      const selectFunc = this.source.get$();
      this.action.call(this, selectFunc);
      return this;
    }
  }

  test () {
    const context = this.context;
    if (typeof this.condition === "function") {
      return this.condition(context);
    } else if (typeof this.condition === "string") {
      return evalStringCondition(this.condition, context);
    }
    return true;
  }
}

module.exports = Check;
