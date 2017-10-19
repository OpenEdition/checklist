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
          <h1 id="checklist-publication-title" class="checklist-publication-title"></h1>
          <div id="checklist-publication-report" class="checklist-publication-report checklist-report-container"></div>
          <h2 class="checklist-toc-heading">Contenu de la publication</h2>
          <ul id="checklist-toc" class="checklist-toc">
          <ul>
        </div>
      </div>
    `;
    this.createView(html);
    this.setTitle(publi.title);
    this.copy(publi.toc);
    this.showPubliReport();
  }

  setTitle (title) {
    this.title = title;
    this.find(".checklist-publication-title").html(svg.book + " " + title);
    return this;
  }

  copy (toc) {
    this.toc = toc;
    const $toc = this.find("#checklist-toc");
    toc.forEach((entry) => {
      const href = entry.href;
      const docId = getDocIdFromPathname(href);

      const metadatas = [];
      for (let metadata in entry) {
        if (metadata === "href" || !entry[metadata]) continue;
        const line = `<p class="checklist-entry-${metadata}">${entry[metadata]}</p>`;
        metadatas.push(line);
      }

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
      const headerHtml = `
        <div class="checklist-toc-entry-header">
          <div class="checklist-toc-entry-brand">${svg.article} Article</div>
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
      const report = this.ui.createReport({
        parent: element,
        docId,
        metadatas: metadatas.join("\n")
      });
      const isCached = report.fromCache();

      if (!isCached) {
        this.unchecked.push(report);
      }
    });
  }

  showPubliReport () {
    const parent = this.find("#checklist-publication-report");
    const docId = getDocIdFromPathname(window.location.pathname);
    const report = this.ui.createReport({parent, docId});
    return report;
  }

  rerunAll () {
    const reports = this.toc.map((entry) => {
      const href = entry.href;
      return this.ui.getReport(href);
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
