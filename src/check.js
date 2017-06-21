const Base = require("./base.js");
const Statement = require("./statement.js");

function getSource (check) {
  // If rule.href is not found then use the checker source (in case of runBatch)
  if (!check.href && check.source) {
    return Promise.resolve(check.source);
  }
  const loader = window.checklist.loader;
  return loader.requestSource(check.href);
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
  // jshint evil: true
  return eval(conditionToEval);
}

function setDone (check) {
  if (check.hasState("done")) return;
  check.triggerState("done", check);
}

class Check extends Base {
  constructor ({ context, docId, rule, source, caller }) {
    super("Check", caller);

    const allowedProps = ["context", "docId", "source", "name", "description", "id", "href", "type", "tags", "condition", "action"];
    this.assign(allowedProps, rule, {context, docId, source});
    this.statements = [];

    getSource(this)
    .then((source) => {
      this.source = source;
      this.triggerState("ready");
    })
    .catch((msg) => {
      this.reject(msg);
    });
  }

  notify (value) {
    const statement = new Statement({check: this, infos: value, caller: this});
    this.forwardEvents(statement, ["marker"]);

    // Increase count if this statement already exists in Check
    const duplicate = statement.getDuplicate();
    if (duplicate) {
      duplicate.add();
      this.emit("statement.update", duplicate);
    } else {
      // Otherwise register it in Check
      this.statements.push(statement);
      this.emit("statement.new", statement);
    }
    return statement;
  }

  reject (errMsg) {
    if (this.hasState("done") || this.hasState("rejected")) return this;
    this.errMsg = errMsg instanceof Error ? errMsg.message : errMsg;
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
      // TODO: do something/run event when timeout
      const delay = 3000;
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
