const EventEmitter = require("eventemitter2").EventEmitter2;

// Load UI styles
require("./css/ui.css");

class UI extends EventEmitter {
  constructor (options) {
    super();
    this.attach(options.parent);
  }

  attach (parent) {
    parent = parent || "body";
    // TODO: placer ça dans un fichier séparé et utiliser un langage de template
    const html = "<div class='checklist-ui'>Test</div>";

    let $parent = $(parent);
    if ($parent.length !== 1) {
      throw Error("UI: parent is required and must be unique");
    }
    this.element = $(html).appendTo(parent);
    this.emit("attached");
    return this;
  }

  hide () {
    $(document.body).removeClass("checklist-visible");
    this.emit("hidden");
    return this;
  }

  show () {
    $(document.body).addClass("checklist-visible");
    this.emit("visible");
    return this;
  }
}

module.exports = UI;
