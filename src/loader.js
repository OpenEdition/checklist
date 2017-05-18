const Base = require("./base.js");
const Source = require("./source.js");

function addSource (loader, href) {
  return new Promise((resolve, reject) => {
    const source = new Source({ href, caller: loader });
    loader.sources.push(source);
    // TODO: return the source and manage all of them with whenState() (see requestSource)
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
      if (!found) {
        return addSource(this, href).then(resolve, reject);
      }
      found.whenState("ready").then(() => resolve(found));
      // FIXME: Error message is not passed as it is with addSource (which is used when the source is created for the first time). This is because states are just booleans. Error message should be stored somehow in Source.
      found.whenState("failed").then(() => reject(Error("Source not found")));
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
