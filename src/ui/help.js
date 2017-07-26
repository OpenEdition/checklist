const View = require("./view.js");

class Help extends View {
  constructor ({ ui, parent }) {
    super("Help", ui, parent);
    this.childpane = true;

    const html = `
      <div id="checklist-help" class="checklist-help checklist-component checklist-childpane">
        <h1>Informations</h1>
        <div id="checklist-help-contents"></div>
        <button class="checklist-help-hide" data-checklist-action="help-hide">Fermer</button>
      </div>
    `;
    this.createView(html);
  }

  setContent (info) {
    const $container = this.find("#checklist-help-contents");
    $container.html(info);
    return this;
  }

  empty () {
    const $container = this.find("#checklist-help-contents");
    $container.empty();
    this.hide();
    return this;
  }
}

module.exports = Help;
