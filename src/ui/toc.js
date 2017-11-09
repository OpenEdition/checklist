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
          <h1>Vérification de la publication</h1>
          <ul id="checklist-toc-stats" class="checklist-toc-stats"></ul>
          <h2 class="checklist-toc-heading">Détails</h2>
          <ul id="checklist-toc" class="checklist-toc"></ul>
        </div>
      </div>
    `;
    this.createView(html);
    this.title = publi.title;
    this.stats = {};
    this.inject(publi.toc);
  }

  addStat (name, nb = 1) {
    if (nb === 0) return this;
    const value = this.stats[name] || 0;
    const newValue = value + nb < 0 ? 0 : value + nb;
    this.stats[name] = newValue;
    const icon = svg[`rating-${name}`];

    let $el = this.find(`.checklist-toc-stat-${name}`);
    if ($el.length === 0) {
      const $parent = this.find("#checklist-toc-stats");
      $el = $(`<li class="checklist-toc-stat-${name}"></li>`);
      $el.appendTo($parent);
    }

    if (newValue === 0) {
      $el.remove();
    } else {
      $el.html(`${icon} ${newValue}`);
    }
    return this;
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

      report.on("rating", () => {
        this.addStat(report.rating);
      });
      report.on("beforeReset", () => {
        this.addStat(report.rating, -1);
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
