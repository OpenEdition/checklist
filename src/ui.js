// TODO: il faudrait que ce soit un event emitter. Pourquoi ne pas étendre https://github.com/Olical/EventEmitter
class UI {
  constructor (options) {
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
    return this;
  }
}

module.exports = UI;
