const svg = require("./svg.json");
const Dropdown = require("./dropdown.js");
const View = require("./view.js");

class Pane extends View {
  constructor ({ ui, parent, publi }) {
    super("Pane", ui, parent);

    const {t, tk} = ui;
    
    this.docId = this.getConfig("docId");
    const homeHref = this.getConfig("homeHref");
    const logo = svg["checklist-logo"];
    const brand = homeHref ? `<a href="${homeHref}">${logo}</a>` : logo;
    
    const paneMessage = this.getConfig("paneMessage");
    const msg = paneMessage ? `<div id="checklist-pane-message" class="checklist-pane-message">${tk(paneMessage)}</div>` : "";

    const html = `<div id="checklist-pane" class="checklist-pane checklist-component">
      <div class="checklist-main-menu">
        <div class="checklist-brand">${brand}</div>
        <div class="checklist-dropdown-container"></div>
        <div class="checklist-main-menu-buttons">
          <button data-checklist-action="settings-show"><i class="fas fa-cog"></i></button>
        </div>
      </div>
      ${msg}
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
