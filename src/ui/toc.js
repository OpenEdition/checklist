const Toolbar = require("./toolbar.js");
const View = require("./view.js");

// Return a flat version of toc
function extractEntries (obj) {
  const reducer = (accumulator, item) => {
    const value = (item.section) ? extractEntries(item.section) : item;
    return accumulator.concat(value);
  };
  return obj.reduce(reducer, []);
}

class TOC extends View {
  constructor ({ ui, parent, publi }) {
    // Use publi.parent if it exists
    parent = publi.parent || parent;

    super("TOC", ui, parent);

    this.unchecked = [];
    const html = `
      <div id="checklist-toc-view" class="checklist-toc-view checklist-component visible">
        <div class="checklist-toc-view-contents">
          <h1>${this.t("toc-title")}</h1>
          <ul id="checklist-toc-stats" class="checklist-toc-stats"></ul>
          <ul id="checklist-toc" class="checklist-toc"></ul>
        </div>
      </div>
    `;
    this.createView(html);

    this.toc = publi.toc;
    this.tocEntries = extractEntries(this.toc);
    this.overview = this.ui.getOverview();
    this.overview.toc = this;
    this.overview.setLength(this.tocEntries.length);

    this.inject();
    this.overview.updateControls();
  }

  addStat (name, nb) {
    this.overview.addStat(name, nb);
    return this;
  }

  inject () {
    const toc = this.toc;
    const $toc = this.find("#checklist-toc");

    const createSection = ($parent, entries) => {
      entries.forEach((entry, index) => {

        // Section
        if (entry.section) {
          const html = `<li class="checklist-toc-section">
              <h2 class="checklist-toc-section-heading">${entry.title}</h2>
              <ul class="checklist-toc-section-contents"></ul>
            </li>`;
          const $section = $(html).appendTo($parent);
          const $contents = $section.find(".checklist-toc-section-contents");
          createSection($contents, entry.section);
          return;
        }

        // Entry
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
              <a class="checklist-report-run" data-checklist-action="report-run">
                <i class="far fa-play-circle"></i> ${this.t("toc-report-run")}
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

        $parent.append($element);
        const element = $element.find(".checklist-toc-entry-contents").get(0);
        const metadatas = `<p class="checklist-entry-title"><a href="${href}">${entry.title}</a></p>`;
        const report = this.ui.createReport({
          parent: element,
          docId,
          href,
          metadatas,
          context: entry.context
        });

        // Source loading failed
        const toggleFail = (flag = true) => {
          if (!flag && !$element.hasClass("checklist-report-failed")) return;

          this.overview.addError(flag);

          $element.toggleClass("checklist-report-failed", flag);
          const $icon = report.find(".checklist-report-icon");
          const html = flag ? "<i class='fas fa-exclamation-triangle'></i>" : "";
          $icon.html(html);
        }

        report.on("failed", () => toggleFail());
        report.on("rating", () => this.addStat(report.rating));
        report.on("beforeReset", () => {
          if (report.hasState("failed")) {
            toggleFail(false);
            return;
          }
          this.addStat(report.rating, -1);
        });

        // Toggle "show details" button
        report.on("afterUpdateView", () => {
          const hasStatements = () => report.find(".checklist-statements .checklist-statement").length > 0;
          const hasRejections = () => report.find(".checklist-rejections .checklist-rejection").length > 0;
          const containsSomething = hasStatements() || hasRejections();
          $element.toggleClass("checklist-report-with-details", containsSomething);
        });

        // Hide "run" button
        const isCached = report.fromCache();
        const hideRunBtn = () => $element.find(".checklist-report-run").addClass("hidden");
        report.on("run", hideRunBtn);
        if (isCached) {
          hideRunBtn();
        }

        // Keep a track of unchecked reports
        if (!isCached) {
          this.unchecked.push(report);
        }
      });
    }

    createSection($toc, toc);
  }

  getReports () {
    const entries = this.tocEntries;
    console.log("entries", entries);
    return entries.map((entry) => {
      const docId = entry.docId || entry.href;
      return this.ui.getReport(docId);
    });
  }

  rerunAll () {
    const reports = this.getReports();
    this.overview.reset();
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

  getStates () {
    const reports = this.getReports();
    console.log("reports", reports);
    const empty = reports.every((r) => !r.hasState("run"));
    const complete = reports.every((r) => r.hasState("done"));
    const ongoing = !empty && !complete;
    const pending = reports.some((r) => r.hasState("run") && !r.hasState("done"));
    const fromCache = reports.some((r) => r.hasState("fromCache"));
    return { empty, complete, ongoing, pending, fromCache };
  }

  focus (duration = 300) {
    const $toc = this.get$element();
    const top = $toc.offset().top;
    $("html, body").animate({scrollTop: top}, duration);
    return this;
  }
}

module.exports = TOC;
