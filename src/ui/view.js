const Base = require("../base.js");

class View extends Base {
  constructor (classname, ui, parent) {
    super(classname, ui);
    this.parent = parent;
  }

  find (selector) {
    if (!this.element && !this.$element) {
      throw Error(`${this.classname}: element attribute not found.`);
    }
    const $element = this.$element || $(this.element);
    return $element.find(selector);
  }
}

module.exports = View;
