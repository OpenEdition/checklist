const svg = require("./svg.json");
const Overview = require("./overview.js");
const Toolbar = require("./toolbar.js");
const View = require("./view.js");

class Pane extends View {
  constructor ({ ui, parent, publi }) {
    super("Pane", ui, parent);

    this.docId = this.getConfig("docId");

    const html = `<div id="checklist-pane" class="checklist-pane checklist-component">
      <div class="checklist-main-menu">
        <div class="checklist-brand">${svg["checklist-logo"]}</div>
        <div class="checklist-main-menu-buttons">
          <button data-checklist-action="settings-show"><i class="fas fa-cog"></i></button>
        </div>
      </div>
      <div class="checklist-toolbar-container"></div>
      <div id="checklist-pane-contents" class="checklist-pane-contents">
      </div>
    </div>`;
    this.createView(html);
    this.createToolbar();

    if (publi) {
      this.showOverview();
    } else {
      this.showReport();
    }
  }

  createToolbar () {
    this.toolbar = new Toolbar({
      ui: this.ui,
      parent: this.find(".checklist-toolbar-container"),
      docId: this.docId
    });
  }

  showReport () {
    const parent = this.find("#checklist-pane-contents");
    const report = this.ui.createReport({parent, docId: this.docId});
    return report;
  }

  showOverview () {
    this.overview = new Overview({
      ui: this.ui,
      parent: this.find("#checklist-pane-contents")
    });
    return this.overview;
  }
}

module.exports = Pane;
