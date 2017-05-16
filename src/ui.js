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
    // FIXME: is it relevant to set this.parent here?
    this.parent = parent;
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

  setToc (toc) {
    const report = this.createWidget({
      templateName: "report",
      parentSelector: this.parent
    });
    report.setToc(toc);
  }

  injectStatement (statement) {
    const get$Target = (statement) => {
      const docId  = statement.docId;
      return $(`[data-checklist-doc-id='${docId}']`);
    };

    const injectStatement = (statement) => {
      const countSpan = (statement.count && statement.count > 1) ? `<span class="checklist-count">${statement.count}</span>` : "";
      const li = `<li class="checklist-statement">${statement.name} ${countSpan}</li>`;
      const $target = get$Target(statement);
      $target.append(li);
      this.emit("injected.statement", statement);
    };

    if (statement instanceof Array) {
      statement.forEach(injectStatement);
      this.emit("injected.statements", statement);
    } else if (statement != null) {
      injectStatement(statement);
    }

    return this;
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
