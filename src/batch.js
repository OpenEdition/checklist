const Base = require("./base.js");

class Batch extends Base {
  constructor (hrefs = []) {
    super("Batch");
    this.hrefs = hrefs;
  }

  init () {
    const loader = window.checklist.loader;
    const hrefs = this.hrefs;
    const promises = hrefs.map((href) => loader.requestSource(href));
    Promise.all(promises).then((sources) => {
      // TODO: remove possible duplicates in sources
      this.sources = sources;
      this.triggerState("ready");
    }).catch((err) => {
      // TODO: error handling ok ?
      throw Error(err);
    });
  }
}

module.exports = Batch;
