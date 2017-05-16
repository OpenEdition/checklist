const Base = require("./base.js");
const Nanobar = require("nanobar");
const templates = require("./templates.js");

function getTemplate (templateName) {
  return templates[templateName];
}

class Widget extends Base {
  constructor ({ caller, parentSelector = "body", templateName }) {
    super("Widget", caller);
    Object.assign(this, {parentSelector, templateName});
    this.triggerState("ready");
  }

  attach () {
    let $parent = $(this.parentSelector);
    if ($parent.length !== 1) {
      throw Error("Widget: parent is required and must be unique");
    }
    const template = getTemplate(this.templateName);

    this.$element = $(template).appendTo($parent);
    this.element = this.$element.get(0);

    this.progressBar = new Nanobar({
      target: this.element
    });

    this.triggerState("attached");
    return this;
  }

  setProgress (percentage) {
    this.progressBar.go(percentage);
  }
}

module.exports = Widget;
