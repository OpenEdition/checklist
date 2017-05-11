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

  postponePromise (state, methodName, ...arg) {
    const fn = this.getMethod(methodName, ...arg);
    return new Promise((resolve, reject) => {
      this.once(state, () => {
        fn().then(resolve);
      });
    });
  }

  // events = ["eventNameNotRenamed", {name: newName}]
  forwardEvents (source, events) {
    function getForwardName (eventName) {
      for (let element of events) {
        const name = element === eventName ? element : element[eventName];
        if (name) return name;
      }
    }

    source.onAny((eventName, ...values) => {
      const forwardName = getForwardName(eventName);
      if (forwardName) {
        this.emit(forwardName, ...values);
      }
    });
  }
}

module.exports = Base;
