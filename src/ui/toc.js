const svg = require("./svg.json");
const View = require("./view.js");
const { getDocIdFromPathname } = require("../utils.js");

class TOC extends View {
  constructor ({ ui, parent, publi }) {
    super("TOC", ui, parent);

    this.unchecked = [];
    const html = `
      <div id="checklist-toc-view" class="checklist-toc-view checklist-component">
        <h1 id="checklist-publication-title" class="checklist-publication-title"></h1>
        <button class="checklist-toc-rerun" data-checklist-action="toc-rerun">${svg.history} Tout rafraîchir</button>
        <div id="checklist-publication-report" class="checklist-publication-report"></div>
        <ul id="checklist-toc" class="checklist-toc">
        <ul>
      </div>
    `;
    this.createView(html);
    this.setTitle(publi.title);
    this.copy(publi.toc);
    this.showPubliReport();
  }

  setTitle (title) {
    this.title = title;
    this.find(".checklist-publication-title").html(title);
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
        <li class="checklist-toc-entry">
          ${metadatas.join("\n")}
        </li>
      `;
      const $element = $(html);
      $toc.append($element);
      const element = $element.get(0);
      const report = this.ui.createReport({parent: element, docId});
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
