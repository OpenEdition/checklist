const View = require("./view.js");
const { getDocIdFromPathname } = require("../utils.js");

class Pane extends View {
  constructor ({ ui, parent }) {
    super("Pane", ui, parent);

    const html = `<div id="checklist-pane" class="checklist-pane checklist-component">
      <div id="checklist-current-report" class="checklist-current-report">
      </div>
      <div class="checklist-menu">
        <button data-checklist-action="settings-show">Préférences</button>
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
