const EventEmitter = require("eventemitter2").EventEmitter2;

function isSelf (url) {
  return !url || url === window.location.href;
}

class Source extends EventEmitter {
  constructor (url) {
    super();
    this.classname = "Source";
    this.url = url;
    this.self = isSelf(url);
  }

  hasUrl (url) {
    return (this.self && isSelf(url)) || this.url === url;
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
