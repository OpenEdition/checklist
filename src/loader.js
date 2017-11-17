const Base = require("./base.js");
const Source = require("./source.js");

class Loader extends Base {
  constructor ({ caller }) {
    super("Loader", caller);

    this.sources = [];
    this.selfSource = this.createSource().load();
    this.triggerState("ready");
  }

  requestSource (href) {
    return new Promise((resolve, reject) => {
      let source = this.getSource(href);
      if (source == null) {
        source = this.createSource(href);
        source.load();
      }

      source.whenState("ready").then(() => {
        if (source.hasState("success")) {
          return resolve(source);
        }
        reject(source.error);
      });
    });
  }

  createSource (href) {
    const source = new Source({ href, caller: this });
    this.sources.push(source);
    return source;
  }

  getSource (href) {
    if (href == null) return this.selfSource;

    return this.sources.find((source) => {
      return source.is(href);
    });
  }
}

module.exports = Loader;
