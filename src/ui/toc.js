const View = require("./view.js");
const { getDocIdFromPathname } = require("../utils.js");

class TOC extends View {
  constructor ({ ui, parent }) {
    super("TOC", ui, parent);

    this.unchecked = [];
    const html = `
      <div id="checklist-toc-view" class="checklist-toc-view checklist-component">
        <div id="checklist-publication-report" class="checklist-publication-report"></div>
        <ul id="checklist-toc" class="checklist-toc">
        <ul>
      </div>
    `;
    this.createView(html);
    this.showPubliReport();
  }

  copy (toc) {
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
        this.unchecked.push(href);
      }
    });
  }

  showPubliReport () {
    const parent = this.find("#checklist-publication-report");
    const docId = getDocIdFromPathname(window.location.pathname);
    const report = this.ui.createReport({parent, docId});
    return report;
  }

  runUnchecked () {
    const unchecked = this.unchecked;
    if (unchecked.length === 0) return this;
    checklist.whenState("ready").then(() => {
      checklist.runBatch(unchecked);
      this.unchecked = [];
    });
    return this;
  }
}

module.exports = TOC;
