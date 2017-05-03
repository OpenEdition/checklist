const EventEmitter = require("eventemitter2").EventEmitter2;

class Base extends EventEmitter {
  constructor (classname) {
    super();
    this.classname = classname;
    this.states = {};
  }

  setState (states) {
    Object.assign(this.states, states);
    return this;
  }

  getState (state) {
    return this.states[state];
  }

  hasState (state) {
    return this.getState(state) === true;
  }
}

module.exports = Base;
