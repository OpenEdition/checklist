const Base = require("./base.js");
const Widget = require("./widget.js");

// Load UI styles
require("./css/ui.css");

class UI extends Base {
  constructor ({ caller }) {
    super("UI", caller);
    this.widgets = {};
    this.triggerState("ready");
  }

  // FIXME: not consistent with other checklist components
  init (parent) {
    this.createWidget({
      templateName: "pane",
      parentSelector: parent
    });
    this.triggerState("initialized");
  }

  createWidget (options) {
    const widget = new Widget(options);
    this.widgets[options.templateName] = widget;
    widget.attach();
    return widget;
  }

  injectStatement (statement) {
    this.widgets.pane.inject(statement, "#checklist-statements");
  }

  hide () {
    $(document.body).removeClass("checklist-visible");
    this.setState("visible", false);
    this.emit("hidden");
    return this;
  }

  show () {
    $(document.body).addClass("checklist-visible");
    this.triggerState("visible");
    return this;
  }
}

module.exports = UI;
