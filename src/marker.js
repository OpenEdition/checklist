const Base = require("./base.js");

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

  inject () {
    const html = `<span class="checklist-marker checklist-marker-type-${this.type}" data-checklist-marker-name="${this.name}"></span>`;
    const $element = $(html);
    if (this.position !== "after") {
        $element.prependTo(this.target);
    } else {
        $element.appendTo(this.target);
    }
    this.element = $element.get(0);
    return this;
  }
}

module.exports = Marker;
