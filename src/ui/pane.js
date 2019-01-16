const svg = require("./svg.json");
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
      this.showTocSwitch();
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

  showTocSwitch () {
    const html = `
      <div id="checklist-toc-control" class="checklist-toc-control">
        <p class="checklist-toc-control-info">${this.t("toc-control-info")}</p>
        <div class="checklist-toc-view-menu">
          <button class="checklist-toc-run" data-checklist-action="toc-run"><i class="fas fa-book"></i> ${this.t("toc-check")}</button>
          <button class="checklist-toc-rerun" data-checklist-action="toc-rerun"><i class="fas fa-history"></i> ${this.t("toc-rerun")}</button>
          <button data-checklist-action="toc-unfold"><i class="far fa-plus-square"></i> ${this.t("toc-unfold")}</button>
          <button data-checklist-action="toc-fold"><i class="far fa-minus-square"></i> ${this.t("toc-fold")}</button>
        </div>
      </div>
    `;
    this.find("#checklist-pane-contents").html(html);
    return this;
  }
}

module.exports = Pane;
