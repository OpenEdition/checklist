const Base = require("./base.js");
const Marker = require("./marker.js");

class Statement extends Base {
  // FIXME: infos cest le bazar : passer de args propres calcules dans Check
  constructor ({check, infos, caller}) {
    super("Statement", caller);
    this.check = check;
    this.docId = check.docId;
    this.markers = [];

    // Get values from check, otherwise default values are inherited from check
    this.assign(["name", "description", "id", "type", "tags"], check, infos);
    this.count = 1;

    // Do we have an id?
    if (this.id == null) {
      // FIXME: Error not raised here
      throw Error("Statement constructor requires an id");
    }

    // Use a default type is no type defined
    const defaultType = "info"; // TODO: move this into config
    this.type = this.type || defaultType;

    // If infos is a string, then use it as the name
    if (typeof infos === "string") {
      this.name = infos;
    }

    // Do we have a name here?
    if (this.name == null) {
      // FIXME: Error not raised here
      throw Error("Statement constructor requires a name");
    }

    // "tags" must be an array
    this.tags = this.tags || [];
  }

  add (nb = 1) {
    this.count += nb;
  }

  getDuplicate () {
    return this.check.statements.find((el) => {
      return this.is(el);
    });
  }

  is (statement) {
    return this.id === statement.id;
  }

  // In rules, set: label = { target, name[, position, type] }
  addMarker (options) {
    const createMarker = (singleTarget, options) => {
      const overwriting = {target: singleTarget, caller: this};
      const newOptions = Object.assign({}, options, overwriting);
      const marker = new Marker(newOptions);
      this.markers.push(marker);
      this.emit("marker", marker);
    };

    // Make sure target is one single element
    const $target = $(options.target);
    $target.each(function () {
      createMarker($(this), options);
    });
    return this;
  }

  // Export instance to a minimal plain object which can be stored in cache
  export () {
    const clone = Base.export(this, ["docId", "states", "name", "description", "id", "type", "tags", "count"]);
    return clone;
  }
}

module.exports = Statement;
