const View = require("./view.js");

class Help extends View {
  constructor ({ ui, parent }) {
    super("Help", ui, parent);

    const html = `
      <div id="checklist-help" class="checklist-help">
        <h1>Informations</h1>
        <div id="checklist-help-contents"></div>
        <button class="checklist-help-close">Fermer</button>
      </div>
    `;
    this.createView(html);
    this.initEventHandlers();
  }

  initEventHandlers () {
    const closeHandler = this.empty.bind(this);
    this.find(".checklist-help-close").click(closeHandler);
    return this;
  }

  setContent (info) {
    const $container = this.find("#checklist-help-contents");
    $container.html(info);
    this.show();
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
