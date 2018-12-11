const Toolbar = require("./toolbar.js");
const View = require("./view.js");

class TOC extends View {
  constructor ({ ui, parent, publi }) {
    // Use publi.parent if it exists
    parent = publi.parent || parent;

    super("TOC", ui, parent);

    this.unchecked = [];
    const html = `
      <div id="checklist-toc-view" class="checklist-toc-view checklist-component">
        <div class="checklist-toc-view-contents">
          <h1>${this.t("toc-title")}</h1>
          <ul id="checklist-toc-stats" class="checklist-toc-stats"></ul>
          <h2 class="checklist-toc-heading">${this.t("toc-details")}</h2>
          <ul id="checklist-toc" class="checklist-toc"></ul>
        </div>
      </div>
    `;
    this.createView(html);
    this.resetStats();
    this.title = publi.title;
    this.inject(publi.toc);

    ui.on("filterStatements", () => {
      this.resetStats();
    });
  }

  addStat (name, nb = 1) {
    if (nb === 0) return this;
    const value = this.stats[name] || 0;
    const newValue = value + nb < 0 ? 0 : value + nb;
    this.stats[name] = newValue;

    const rating = this.ui.getRating(name);

    // FIXME: this should not happen. If so, then display an error in the Report.
    if (rating == null) return;

    const icon = rating.icon;
    let $el = this.find(`.checklist-toc-stat-${name}`);
    $el.html(`${icon} ${newValue}`);
    $el.toggleClass("visible", newValue > 0);
    return this;
  }

  resetStats () {
    this.stats = {};
    const ratings = this.getConfig("ratings", []);
    const $parent = this.find("#checklist-toc-stats");
    const statsHtml = ratings.map((rating) => {
      return `<li class="checklist-toc-stat-${rating.id}"></li>`;
    }).join("\n");
    $parent.html(statsHtml);
    return this;
  }

  inject (toc) {
    this.toc = toc;
    const $toc = this.find("#checklist-toc");

    toc.forEach((entry, index) => {
      const href = entry.href;
      const docId = entry.docId || href;

      const html = `
        <li class="checklist-toc-entry checklist-report-container">
          <div class="checklist-toc-entry-contents"></div>
          <div class="checklist-toc-entry-footer">
            <a class="checklist-toggle-report-details" data-checklist-action="toggle-report-details">
              <span class="checklist-toggle-report-details-show"><i class="far fa-plus-square"></i> ${this.t("toc-show-details")}</span>
              <span class="checklist-toggle-report-details-hide"><i class="far fa-minus-square"></i> ${this.t("toc-hide-details")}</span>
            </a>
          </div>
        </li>
      `;
      const $element = $(html);

      // Create toolbar
      const type = entry.type || this.t("article");
      const icon = entry.icon || "<i class='far fa-file-alt'></i>";
      const headerHtml = `
        <div class="checklist-toc-entry-header">
          <div class="checklist-toc-entry-brand">${icon} ${type}</div>
        </div>
      `;
      const $toolbarParent = $(headerHtml);
      $toolbarParent.prependTo($element);
      new Toolbar({
        ui: this.ui,
        parent: $toolbarParent,
        docId: docId,
        context: entry.context
      });

      $toc.append($element);
      const element = $element.find(".checklist-toc-entry-contents").get(0);
      const metadatas = `<p class="checklist-entry-title"><a href="${href}">${entry.title}</a></p>`;
      const report = this.ui.createReport({
        parent: element,
        docId,
        href,
        metadatas,
        context: entry.context
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
      const docId = entry.docId || entry.href;
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
