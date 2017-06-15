const Base = require("./base.js");

// TODO: don't use markers when runBatch
class Marker extends Base {
  constructor ({ caller, target, name, position = "before", type }) {
    super("Marker", caller);

    if (!target || !name) {
      // FIXME: uncaught error here !!!
      throw Error("Can not create Marker: bad or missing parameters");
    }
    type = type || caller.type;
    Object.assign(this, {target, name, position, type});
  }

  setElement (element) {
    this.element = element;
    return this;
  }
}

module.exports = Marker;
