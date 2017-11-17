const Base = require("./base.js");
const Source = require("./source.js");

class Loader extends Base {
  constructor ({ caller }) {
    super("Loader", caller);

    this.sources = [];
    this.selfSource = this.loadSource();
    this.triggerState("ready");
  }

  // Load and register a new Source (it doesn't check duplicates!)
  loadSource (href) {
    const source = new Source({ href, caller: this });
    source.load();
    this.sources.push(source);
    return source;
  }

  requestSource (href) {
    return new Promise((resolve, reject) => {
      const source = this.getSource(href) || this.loadSource(href);

      source.whenState("ready").then(() => {
        if (source.hasState("success")) {
          return resolve(source);
        }
        reject(source.error);
      });
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
