const svg = require("./svg.json");
const Dropdown = require("./dropdown.js");
const View = require("./view.js");

class Pane extends View {
  constructor ({ ui, parent, publi }) {
    super("Pane", ui, parent);

    this.docId = this.getConfig("docId");

    const t = this.ui.t;
    const html = `<div id="checklist-pane" class="checklist-pane checklist-component">
      <div class="checklist-main-menu">
        <div class="checklist-brand">${svg["checklist-logo"]}</div>
        <div class="checklist-dropdown-container"></div>
        <div class="checklist-main-menu-buttons">
          <button data-checklist-action="settings-show"><i class="fas fa-cog"></i></button>
        </div>
      </div>
      <div id="checklist-pane-contents" class="checklist-pane-contents"></div>
      <div id="checklist-pane-footer" class="checklist-pane-footer">
        <div class="checklist-cache-alert">
          ${t("cache-is-full")}
        </div>
      </div>
    </div>`;
    this.createView(html);
    this.createDropdown();

    if (!publi) {
      this.showReport();
    }
  }

  createDropdown () {
    this.dropdown = new Dropdown({
      ui: this.ui,
      parent: this.find(".checklist-dropdown-container"),
      docId: this.docId
    });
  }

  showReport () {
    const parent = this.find("#checklist-pane-contents");
    const report = this.ui.createReport({parent, docId: this.docId});
    return report;
  }
}

module.exports = Pane;
