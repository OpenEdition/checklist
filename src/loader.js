const Base = require("./base.js");
const Source = require("./source.js");

function getNewSource (loader, href) {
  const source = new Source({ href, caller: loader });
  source.load();
  return source;
}

function registerSource (loader, source) {
  loader.sources.push(source);
  return source;
}

class Loader extends Base {
  constructor ({ caller }) {
    super("Loader", caller);

    this.selfSource = getNewSource(this);
    this.sources = [this.selfSource];
    this.triggerState("ready");
  }

  requestSource (href) {
    return new Promise((resolve, reject) => {
      const source = this.getSource(href) || registerSource(this, getNewSource(this, href));

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
