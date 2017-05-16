const Base = require("./base.js");
const Source = require("./source.js");

function addSource (loader, location) {
  return new Promise((resolve, reject) => {
    const source = new Source({ location, caller: loader });
    loader.sources.push(source);
    source.on("ready", () => resolve(source));
    source.on("failed", (err)=> reject(err));
    source.load();
  });
}

class Loader extends Base {
  constructor ({ caller }) {
    super("Loader", caller);

    this.sources = [];
    // Add self
    addSource(this)
      .then((source) => {
        this.selfSource = source;
        this.triggerState("ready");
      });
  }

  requestSource (href) {
    return new Promise((resolve, reject) => {
      const found = this.getSource(href);
      if (found) {
        resolve(found);
        return;
      }
      addSource(this, href).then(resolve, reject);
    });
  }

  getSource (href) {
    return this.sources.find((source) => {
      return source.is(href);
    });
  }

  getSelfSource () {
    return this.selfSource;
  }
}

module.exports = Loader;
