const Base = require("../base.js");

class View extends Base {
  constructor (classname, ui, parent) {
    super(classname, ui);
    this.parent = parent;
    this.ui = ui;
  }

  createView (html) {
    this.$element = $(html).appendTo(this.parent);
    this.element = this.$element.get(0);
    return this;
  }

  get$element () {
    if (!this.element && !this.$element) {
      throw Error(`${this.classname}: element attribute not found.`);
    }
    const $element = this.$element || $(this.element);
    return $element;
  }

  find (selector) {
    const $element = this.get$element();
    return $element.find(selector);
  }

  show () {
    const $element = this.get$element();
    $element.addClass("visible");
    return this;
  }

  hide () {
    const $element = this.get$element();
    $element.removeClass("visible");
    return this;
  }
}

module.exports = View;
