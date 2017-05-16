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

  inject (statement, targetSelector) {
    if (!this.hasState("attached")) {
      throw Error("Widget is not attached");
    }

    const injectStatement = (statement) => {
      const countSpan = (statement.count && statement.count > 1) ? `<span class="checklist-count">${statement.count}</span>` : "";
      const li = `<li class="checklist-statement">${statement.name} ${countSpan}</li>`;
      this.$element.children(targetSelector).append(li);
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

  setProgress (percentage) {
    this.progressBar.go(percentage);
  }
}

module.exports = Widget;
