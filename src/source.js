const EventEmitter = require("eventemitter2").EventEmitter2;

class Source extends EventEmitter {
  constructor (url) {
    super();
    this.classname = "Source";
    this.url = url;
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
