const Base = require("./base.js");
const Source = require("./source.js");

class Loader extends Base {
  constructor ({ caller }) {
    super("Loader", caller);

    this.sources = [];
    this.selfSource = this.loadSource();
    this.triggerState("ready");
  }

  // Load and register a new Source
  loadSource (href) {
    const source = this.getSource(href);
    if (source) return source;

    const newSource = new Source({ href, caller: this });
    newSource.load();
    this.sources.push(newSource);
    return newSource;
  }

  requestSource (href) {
    return new Promise((resolve, reject) => {
      const source = this.loadSource(href);

      source.whenState("ready").then(() => {
        if (source.hasState("success")) {
          return resolve(source);
        }
        reject(source.error);
      });
    });
  }

  getSource (href) {
    if (href == null) return this.selfSource;

    return this.sources.find((source) => {
      return source.is(href);
    });
  }
}

module.exports = Loader;
