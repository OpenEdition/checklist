const Base = require("./base.js");

class Config extends Base {
  constructor () {
    super("Config");
    this.entries = {};
  }

  set (key, value) {
    this.entries[key] = value;
    return this;
  }

  get (key, defaultValue) {
    return this.entries[key] || defaultValue;
  }
}

module.exports = Config;
