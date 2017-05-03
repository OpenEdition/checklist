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

  whenState (state) {
    const hasState = this.hasState(state);
    if (hasState) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      this.once(state, resolve);
    });
  }
}

module.exports = Base;
