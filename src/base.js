const EventEmitter = require("eventemitter2").EventEmitter2;

class Base extends EventEmitter {
  constructor (classname, caller) {
    super();
    this.classname = classname;
    this.caller = caller;
    this.checklist = caller ? caller.checklist : this;
    this.states = {};
  }

  assign (props, ...objects) {
    const filterOutUnallowedProps = (props, obj) => {
      const filtered = {};
      props.forEach((key) => {
        filtered[key] = obj[key];
      });
      return filtered;
    };

    const merged = Object.assign({}, ...objects);
    const filtered = filterOutUnallowedProps(props, merged);
    Object.assign(this, filtered);
  }

  setState (state, value) {
    this.states[state] = value;
    return this;
  }

  triggerState (state, ...args) {
    this.setState(state, true);
    this.emit(state, ...args);
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

  clearStates () {
    this.states = {};
    return this;
  }

  getMethod (methodName, ...args) {
    return this[methodName].bind(this, ...args);
  }

  postponePromise (state, methodName, ...arg) {
    const fn = this.getMethod(methodName, ...arg);
    return new Promise((resolve, reject) => {
      this.once(state, () => {
        fn().then(resolve, reject);
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

  getConfig (key, defaultValue) {
    return this.checklist.config.get(key, defaultValue);
  }

  static export (instance, keys, forceDone) {
    if (forceDone && !instance.hasState("done")) {
      throw Error(`${instance.classname} instance must have the "done" state to be exported`);
    }
    const clone = {};
    keys.forEach((key) => {
      clone[key] = instance[key];
    });
    return clone;
  }

  static testCondition (condition, context) {
    // Eval a condition defined as a string
    function evalStringCondition (condition, context) {
      // Replace context keys by their values in string (false if undefined)
      function replaceAttributes (condition, context) {
        const regex = /\b[^!&|()]*\b/g;
        return condition.replace(regex, (key) => {
          if (key.trim().length === 0) return key;
          return typeof context[key] !== "undefined" ? context[key] : false;
        });
      }

      const conditionToEval = replaceAttributes(condition, context);
      // No worry, eval is safe here
      // jshint evil: true
      return eval(conditionToEval);
    }

    if (typeof condition === "function") {
      return condition(context);
    } else if (typeof condition === "string") {
      return evalStringCondition(condition, context);
    }
    return true;
  }
}

module.exports = Base;
