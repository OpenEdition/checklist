const Base = require("./base.js");

class Marker extends Base {
  constructor ({ caller, element, name, position = "before", type }) {
    super("Marker", caller);

    if (!element || !name) {
      // FIXME: uncaught error here !!!
      throw Error("Can not create Marker: bad or missing parameters");
    }
    type = type || caller.type;
    Object.assign(this, {element, name, position, type});
  }
}

module.exports = Marker;
