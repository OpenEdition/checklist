const Base = require("../base.js");

class View extends Base {
  constructor (classname, ui, parent) {
    super(classname, ui);
    this.parent = parent;
    this.ui = ui;
  }

  clear () {
    const $el = this.get$element();
    if (!$el) return;
    $el.remove();
    return this;
  }

  createView (html) {
    if (html == null) return;
    this.$element = $(html).appendTo(this.parent);
    this.element = this.$element.get(0);
    this.element.view = this;
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
    this.toggle(true);
    return this;
  }

  hide () {
    this.toggle(false);
    return this;
  }

  toggle (flag) {
    const $element = this.get$element();
    $element.toggleClass("visible", flag);
    return this;
  }

  close () {
    this.hide();
  }

  t (...args) {
    if (typeof this.ui.t !== "function") throw Error("i18n is not ready");
    return this.ui.t(...args);
  }

  tk (...args) {
    return this.ui.tk(...args);
  }
}

module.exports = View;
