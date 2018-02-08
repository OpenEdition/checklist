const Base = require("./base.js");

class Config extends Base {
  constructor ({ caller }) {
    super("Config", caller);
    this.entries = {};
    this.triggerState("ready");
  }

  get (key, defaultValue) {
    if (key == null) return this.getAll();
    return this.entries[key] || defaultValue;
  }

  getAll () {
    return this.entries;
  }

  set (key, value) {
    if (typeof key === "object" && value == null) {
      return this.extend(key);
    }
    this.entries[key] = value;
    return this;
  }

  extend (...args) {
    // FIXME: extend will override the user config?
    $.extend(true, this.entries, ...args);
    return this;
  }

  clear () {
    this.entries = {};
    return this;
  }
}

module.exports = Config;
