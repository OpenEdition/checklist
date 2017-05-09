const EventEmitter = require("eventemitter2").EventEmitter2;

class Base extends EventEmitter {
  constructor (classname) {
    super();
    this.classname = classname;
    this.states = {};
  }

  setState (state, value) {
    this.states[state] = value;
    return this;
  }

  triggerState (state, msg, flag = true) {
    this.setState(state, flag);
    this.emit(state, msg);
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

  getMethod (methodName, ...args) {
    return this[methodName].bind(this, ...args);
  }

  postpone (state, methodName, ...arg) {
    const fn = this.getMethod(methodName, ...arg);
    return this.once(state, fn);
  }

  forwardEvents (source, eventsToForward) {
    const isForwardable = (eventName) => eventsToForward.includes(eventName);
    source.onAny((eventName, ...values) => {
      if (isForwardable(eventName)) {
        this.emit(eventName, ...values);
      }
    });
  }
}

module.exports = Base;
