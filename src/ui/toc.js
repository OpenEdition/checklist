const svg = require("./svg.json");
const Toolbar = require("./toolbar.js");
const View = require("./view.js");
const { getDocIdFromPathname } = require("../utils.js");

class TOC extends View {
  constructor ({ ui, parent, publi }) {
    super("TOC", ui, parent);

    this.unchecked = [];
    const html = `
      <div id="checklist-toc-view" class="checklist-toc-view checklist-component">
        <div class="checklist-toc-view-contents">
          <ul id="checklist-toc" class="checklist-toc">
          <ul>
        </div>
      </div>
    `;
    this.createView(html);
    this.title = publi.title;
    this.inject(publi.toc);
  }

  inject (toc) {
    this.toc = toc;
    const $toc = this.find("#checklist-toc");

    toc.forEach((entry, index) => {
      const href = entry.href;
      const docId = getDocIdFromPathname(href);

      const html = `
        <li class="checklist-toc-entry checklist-report-container">
          <div class="checklist-toc-entry-contents"></div>
          <div class="checklist-toc-entry-footer">
            <a class="checklist-toggle-report-details" data-checklist-action="toggle-report-details">
              <span class="checklist-toggle-report-details-show">${svg["square-plus"]} Afficher les détails</span>
              <span class="checklist-toggle-report-details-hide">${svg["square-minus"]} Masquer les détails</span>
            </a>
          </div>
        </li>
      `;
      const $element = $(html);

      // Create toolbar
      const type = entry.type || "Article";
      const icon = entry.icon || "article";
      const headerHtml = `
        <div class="checklist-toc-entry-header">
          <div class="checklist-toc-entry-brand">${svg[icon]} ${type}</div>
        </div>
      `;
      const $toolbarParent = $(headerHtml);
      $toolbarParent.prependTo($element);
      new Toolbar({
        ui: this.ui,
        parent: $toolbarParent,
        docId: docId
      });

      $toc.append($element);
      const element = $element.find(".checklist-toc-entry-contents").get(0);
      const metadatas = `<p class="checklist-entry-title">${entry.title}</p>`;
      const report = this.ui.createReport({
        parent: element,
        docId,
        metadatas
      });
      const isCached = report.fromCache();

      if (!isCached) {
        this.unchecked.push(report);
      }
    });
  }

  rerunAll () {
    const reports = this.toc.map((entry) => {
      const docId = getDocIdFromPathname(entry.href);
      return this.ui.getReport(docId);
    });
    reports.forEach((report) => {
      report.rerun();
    });
    this.unchecked = [];
    return this;
  }

  runUnchecked () {
    const unchecked = this.unchecked;
    unchecked.forEach((report) => {
      report.rerun();
    });
    this.unchecked = [];
    return this;
  }
}

module.exports = TOC;
