const EventEmitter = require("eventemitter2").EventEmitter2;

// Arg can be a href, an url or an instance of source
function getUrl (arg = "") {
  const hrefOrUrl = arg instanceof Source ? arg.url.href : arg;
  return new URL(hrefOrUrl, window.location.href);
}

class Source extends EventEmitter {
  constructor (href) {
    super();
    this.classname = "Source";
    this.url = getUrl(href);
    this.self = this.isSelf();
  }

  is (arg) {
    const url = getUrl(arg);
    return this.url.href === url.href;
  }

  isSelf () {
    return this.url.href === window.location.href;
  }

  load () {
    // TODO: do stuff...
    this.emit("ready");
  }

  get$ () {
    return (selector, arg) => $(selector, arg || this.root);
  }
}

module.exports = Source;
