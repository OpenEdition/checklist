const View = require("./view.js");

class Help extends View {
  constructor ({ ui, parent }) {
    super("Help", ui, parent);
    this.childpane = true;

    const html = `
      <div id="checklist-help" class="checklist-help checklist-component checklist-childpane">
      <button class="checklist-close-btn" data-checklist-action="close-component"><i class="fas fa-times-circle"></i></button>
        <h1><i class="fas fa-info-circle"></i> ${this.t("help-title")}</h1>
        <div id="checklist-help-contents"></div>
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

  close () {
    this.empty();
  }
}

module.exports = Help;
