const Base = require("./base.js");

class Config extends Base {
  constructor ({ caller }) {
    super("Config", caller);
    this.entries = {};
    this.triggerState("ready");
  }

  get (key, defaultValue) {
    if (key == null) return this.getAll();
    const value = this.entries[key];
    return value !== undefined ? value : defaultValue;
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
    $.extend(true, this.entries, ...args);
    return this;
  }

  clear () {
    this.entries = {};
    return this;
  }
}

module.exports = Config;
