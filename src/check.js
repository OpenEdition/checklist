const Base = require("./base.js");
const Statement = require("./statement.js");

function getSource (check) {
  const loader = window.checklist.loader;
  
  if (typeof check.href === "string") {
    return loader.requestSource(check.href);
  } else if (typeof check.href === "function") {
    const computedHref = check.href(check);
    return loader.requestSource(computedHref);
  }
  return Promise.resolve(check.source);
}

function setDone (check) {
  if (check.hasState("done")) return;
  check.triggerState("done", check);
}

function getIdFromName (name) {
  if (typeof name === "object" && name.length > 0) {
    name = Object.values(name)[0];
  }
  return name.replace(/\W/gi, "-").toLowerCase();
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

  notify (value, markerObj) {
    if (!value) return;

    if (typeof value === "string") {
      value = { name: value };
    }

    if (typeof value === "number" && value > 0) {
      value = { count: value };
    }

    if (value == null) {
      value = {};
    }

    const name = value.name || this.name;
    const id = value.id || this.id || getIdFromName(name);
    const description = value.description || this.description;
    const type = value.type || this.type || this.getConfig("defaultType", "info");
    const tags = value.tags || this.tags || [];
    const count = value.count || 1;

    let statement = new Statement({name, id, description, type, tags, count, caller: this});
    this.forwardEvents(statement, ["marker"]);

    // Increase count if this statement already exists in Check
    const duplicate = statement.getDuplicate();
    if (duplicate) {
      duplicate.add(count);
      this.emit("statement.update", duplicate);
      statement = duplicate;
    } else {
      // Otherwise register it in Check
      this.statements.push(statement);
      this.emit("statement.new", statement);
    }

    // Add marker
    if (markerObj) {
      statement.addMarker(markerObj);
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

  resolve (value, markerObj) {
    if (this.hasState("done") || this.hasState("success")) return this;
    this.notify(value, markerObj);
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
    if (this.hasState("dropped")) return this.resolve();

    const delay = this.getConfig("checkTimeout", 3000);
    const timeoutMsg = `Check execution timeout (${delay} ms)`;
    setTimeout(this.reject.bind(this, timeoutMsg), delay);
    const selectFunc = this.source.get$();
    const bodyClasses = this.source.bodyClasses;
    try {
      this.action.call(this, selectFunc, bodyClasses);
    } catch (e) {
      this.reject(e);
    }
    return this;
  }

  test () {
    return Base.testCondition(this.condition, this.context);
  }
}

module.exports = Check;
