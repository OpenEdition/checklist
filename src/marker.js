const Base = require("./base.js");

class Marker extends Base {
  constructor ({ caller, target, name, position = "before", type }) {
    super("Marker", caller);

    if (!target || !name) {
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
