const EventEmitter = require("eventemitter2").EventEmitter2;
const Source = require("./source.js");

class Loader extends EventEmitter {
  constructor () {
    super();
    this.classname = "Loader";
    this.sources = [];
    // Add self
    this.addSource();
  }

  addSource (href, callback) {
    const source = new Source(href);
    this.sources.push(source);
    if (typeof callback === "function") {
      source.on("ready", () => {
        callback(source);
      });
    }
    source.load();
    return this;
  }

  requestSource (href, callback) {
    const found = this.getSource(href);
    if (found) {
      callback(found);
      return this;
    }
    this.addSource(href, callback);
    return this;
  }

  getSource (href) {
    return this.sources.find((source) => {
      return source.is(href);
    });
  }
}

module.exports = Loader;
