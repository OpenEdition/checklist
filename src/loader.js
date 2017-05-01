const Base = require("./base.js");
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

class Loader extends Base {
  constructor () {
    super("Loader");
    
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
