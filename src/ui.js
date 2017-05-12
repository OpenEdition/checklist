const Base = require("./base.js");

// Load UI styles
require("./css/ui.css");

class UI extends Base {
  constructor ({ caller }) {
    super("UI", caller);
    this.triggerState("ready");
  }

  attach (parent) {
    parent = parent || "body";
    // TODO: placer ça dans un fichier séparé et utiliser un langage de template
    const html = `
      <div id="checklist-ui" class="checklist-ui">
        <ul id="checklist-statements" class="checklist-statements"></ul>
      </div>
    `;

    let $parent = $(parent);
    if ($parent.length !== 1) {
      throw Error("UI: parent is required and must be unique");
    }
    this.element = $(html).appendTo(parent);
    this.triggerState("attached");
    return this;
  }

  inject (statement) {
    if (!this.hasState("attached")) {
      throw Error("UI is not attached");
    }

    const injectStatement = (statement) => {
      const countSpan = (statement.count && statement.count > 1) ? `<span class="checklist-count">${statement.count}</span>` : "";
      const li = `<li class="checklist-statement">${statement.name} ${countSpan}</li>`;
      this.element.children("#checklist-statements").append(li);
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
