const svg = require("./svg.json");
const View = require("./view.js");
const { getDocIdFromPathname } = require("../utils.js");

class Pane extends View {
  constructor ({ ui, parent, publi }) {
    super("Pane", ui, parent);

    const html = `<div id="checklist-pane" class="checklist-pane checklist-component">
      <div class="checklist-main-menu">
        <div class="checklist-brand">${svg["checklist-logo"]}</div>
        <div class="checklist-main-menu-buttons">
          <button data-checklist-action="settings-show">${svg.settings}</button>
        </div>
      </div>
      <div id="checklist-pane-contents" class="checklist-pane-contents">
      </div>
    </div>`;
    this.createView(html);

    if (publi) {
      this.showTocSwitch();
    } else {
      this.showReport();
    }
  }

  showReport () {
    const parent = this.find("#checklist-pane-contents");
    const docId = getDocIdFromPathname(window.location.pathname);
    const report = this.ui.createReport({parent, docId});
    return report;
  }

  showTocSwitch () {
    const html = `
      <div id="checklist-toc-control" class="checklist-toc-control">
        <p class="checklist-toc-control-info">Vous avez la possibilité de controler le contenu de cette publication.</p>
        <button class="checklist-if-toc-is-hidden" data-checklist-action="toc-toggle">Controler la publication</button>
        <div class="checklist-toc-view-menu checklist-if-toc-is-visible">
          <button class="checklist-toc-rerun" data-checklist-action="toc-rerun">${svg.history} Tout rafraîchir</button>
          <button data-checklist-action="toc-unfold">${svg["square-plus"]} Tout déplier</button>
          <button data-checklist-action="toc-fold">${svg["square-minus"]} Tout replier</button>
          <button data-checklist-action="toc-toggle">× Masquer</button>
        </div>
      </div>
    `;
    this.find("#checklist-pane-contents").html(html);
    return this;
  }
}

module.exports = Pane;
