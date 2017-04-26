const EventEmitter = require("eventemitter2").EventEmitter2;
const Source = require("./source.js");

function addSource (loader, href, callback) {
  const source = new Source(href);
  loader.sources.push(source);
  if (typeof callback === "function") {
    source.on("ready", () => {
      callback(source);
    });
  }
  source.load();
}

class Loader extends EventEmitter {
  constructor () {
    super();
    this.classname = "Loader";
    this.sources = [];
    // Add self
    addSource(this);
  }

  requestSource (href, callback) {
    const found = this.getSource(href);
    if (found) {
      callback(found);
      return this;
    }
    addSource(this, href, callback);
    return this;
  }

  getSource (href) {
    return this.sources.find((source) => {
      return source.is(href);
    });
  }
}

module.exports = Loader;
