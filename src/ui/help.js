const svg = require("./svg.json");
const View = require("./view.js");

class Help extends View {
  constructor ({ ui, parent }) {
    super("Help", ui, parent);
    this.childpane = true;

    const html = `
      <div id="checklist-help" class="checklist-help checklist-component checklist-childpane">
      <button class="checklist-close-btn" data-checklist-action="close-component">×</button>
        <h1>${svg.help} ${t("help-title")}</h1>
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
