const View = require("./view.js");
const { getDocIdFromPathname } = require("../utils.js");

class TOC extends View {
  constructor ({ ui, parent }) {
    super("TOC", ui, parent);

    const html = `
      <div id="checklist-toc-view" class="checklist-toc-view">
        <ul id="checklist-toc" class="checklist-toc">
        <ul>
      </div>
    `;
    this.createView(html);
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
      report.fromCache();
    });
  }
}

module.exports = TOC;
