const svg = require("./svg.json");
const View = require("./view.js");
const { getDocIdFromPathname } = require("../utils.js");

class Pane extends View {
  constructor ({ ui, parent }) {
    super("Pane", ui, parent);

    const html = `<div id="checklist-pane" class="checklist-pane checklist-component">
      <div class="checklist-main-menu">
        <div class="checklist-brand">${svg["checklist-logo"]}</div>
        <div class="checklist-main-menu-buttons">
          <button data-checklist-action="settings-show">${svg.settings}</button>
        </div>
      </div>
      <div id="checklist-current-report" class="checklist-current-report">
      </div>
    </div>`;
    this.createView(html);
    this.showReport();
  }

  showReport () {
    const parent = this.find("#checklist-current-report");
    const docId = getDocIdFromPathname(window.location.pathname);
    const report = this.ui.createReport({parent, docId});
    return report;
  }
}

module.exports = Pane;
