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

  addSource (url, callback) {
    const source = new Source(url);
    this.sources.push(source);
    if (typeof callback === "function") {
      source.on("ready", () => {
        callback(source);
      });
    }
    source.load();
    return this;
  }

  requestSource (url, callback) {
    const found = this.getSource(url);
    if (found) {
      callback(found);
      return this;
    }
    this.addSource(url, callback);
    return this;
  }

  getSource (url) {
    return this.sources.find((source) => {
      return source.hasUrl(url);
    });
  }
}

module.exports = Loader;
