const Base = require("./base.js");
const Source = require("./source.js");

class Loader extends Base {
  constructor ({ caller }) {
    super("Loader", caller);

    this.sources = [];
    this.queue = [];
    this.maxSourcesLoading = this.getConfig("maxSourcesLoading", 5);
    this.loadingCount = 0;
    this.selfSource = this.createSource().load();
    this.triggerState("ready");
  }

  requestSource (href) {
    return new Promise((resolve, reject) => {
      let source = this.getSource(href);
      if (source == null) {
        source = this.createSource(href);
        this.loadSource(source);
      }

      source.whenState("ready").then(() => {
        this.loadingCount--;
        this.dequeue();
        if (source.hasState("success")) {
          return resolve(source);
        }
        reject(source.error);
      })
      .catch(console.error);
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

  getSourceIndex (href) {
    if (href == null) return -1;
    return this.sources.findIndex((source) => {
      return source.is(href);
    });
  }

  loadSource (source) {
    if (this.loadingCount < this.maxSourcesLoading) {
      this.loadingCount++;
      return source.load();
    }
    this.enqueue(source);
  }

  enqueue (source) {
    this.queue.push(source);
  }

  dequeue () {
    const source = this.queue.shift();
    if (source == null) return;
    this.loadSource(source);
  }

  removeSource (href) {
    const sourceIndex = this.getSourceIndex(href);
    if (sourceIndex === -1 || this.sources[sourceIndex].isSelf()) return this;
    this.sources.splice(sourceIndex, 1);
    return this;
  }
}

module.exports = Loader;
