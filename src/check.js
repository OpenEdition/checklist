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

    if (!this.test()) {
      this.triggerState("dropped", this);
      this.triggerState("ready");
      return;
    }

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
    if (value === false) return;

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
    if (value != null) {
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

    if (this.hasState("run")) return this;

    this.triggerState("run", this);

    if (!this.hasState("dropped")) {
      // TODO: move delay in config
      // TODO: do something/run event when timeout
      const delay = 3000;
      setTimeout(this.resolve.bind(this), delay);
      const selectFunc = this.source.get$();
      const bodyClasses = this.source.bodyClasses;
      this.action.call(this, selectFunc, bodyClasses);
    }

    return this.resolve();
  }

  test () {
    return Base.testCondition(this.condition, this.context);
  }

  // Export instance to a minimal plain object which can be stored in cache
  export () {
    const clone = Base.export(this, ["states", "name", "id", "href", "errMsg"], true);
    clone.statements = this.statements.map((statement) => statement.export());
    return clone;
  }
}

module.exports = Check;
