const Base = require("./base.js");
const Report = require("./report.js");
const { getDocIdFromPathname } = require("./utils.js");

// Load UI styles
require("./css/ui.css");

class UI extends Base {
  constructor ({ caller }) {
    super("UI", caller);
    this.reports = {};
    this.triggerState("ready");
  }

  // FIXME: not consistent with other checklist components
  init (parent) {
    const createPane = (parent) => {
      const html = `<div id="checklist-pane" class="checklist-pane"></div>`;
      const element = $(html).appendTo(parent).get(0);
      const docId = getDocIdFromPathname(window.location.pathname);
      this.createReport({element, docId});
      return element;
    };

    const createTocView = (parent) => {
      const html = `
        <div id="checklist-toc-view" class="checklist-toc-view">
          <ul id="checklist-toc" class="checklist-toc">
          <ul>
        </div>
      `;
      const element = $(html).appendTo(parent).get(0);
      return element;
    };

    // FIXME: is it relevant to set this.parent here?
    this.parent = parent;
    this.pane = createPane(parent);
    this.tocView = createTocView(parent);
    this.triggerState("initialized");
  }

  createReport (options) {
    const optionsCopy = Object.assign({}, options, {caller: this});
    const report = new Report(optionsCopy);
    this.reports[options.docId] = report;
    return report;
  }

  getReport (docId) {
    return this.reports[docId];
  }

  copyToc (toc) {
    const getHtml = (toc) => {
      const lines = toc.map((entry) => {
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
            <ul class="checklist-statements" data-checklist-doc-id=${docId}></ul>
          </li>
        `;
        return html;
      });
      return lines.join("\n");
    };

    const html = getHtml(toc);
    const $toc = $("#checklist-toc");
    $toc.append(html);
  }

  connectChecker (checker) {
    const docId = checker.docId;
    const report = this.getReport(docId);
    if (!report) {
      // FIXME: what to do here? which use case?
      console.log(this.reports);
      console.error(`Report not found for ${docId}`);
    }
    report.connect(checker);
    return this;
  }

  hide () {
    $(document.body).removeClass("checklist-visible");
    this.setState("visible", false);
    this.emit("hidden");
    return this;
  }

  show () {
    $(document.body).addClass("checklist-visible");
    this.triggerState("visible");
    return this;
  }
}

module.exports = UI;
