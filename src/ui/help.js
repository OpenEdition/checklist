const View = require("./view.js");

class Help extends View {
  constructor ({ ui, parent }) {
    super("Help", ui, parent);
    this.childpane = true;

    const html = `
      <div id="checklist-help" class="checklist-help checklist-component checklist-childpane">
        <div class="checklist-main-menu">
          <div class="checklist-main-menu-title"><i class="fas fa-info-circle"></i> ${this.t("help-title")}</div>
          <div class="checklist-main-menu-buttons">
            <button class="checklist-close-btn" data-checklist-action="close-component"><i class="fas fa-times-circle"></i></button>
          </div>
        </div>
        <div class="checklist-pane-contents">
          <div id="checklist-help-contents"></div>
        </div>
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
