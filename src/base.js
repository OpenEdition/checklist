const EventEmitter = require("eventemitter2").EventEmitter2;

class Base extends EventEmitter {
  constructor () {
    super();
  }
}

module.exports = Base;
