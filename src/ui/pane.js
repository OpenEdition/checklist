const View = require("./view.js");
const { getDocIdFromPathname } = require("../utils.js");

class Pane extends View {
  constructor ({ ui, parent }) {
    super("Pane", ui, parent);

    const html = `<div id="checklist-pane" class="checklist-pane checklist-component"></div>`;
    this.createView(html);
    this.showReport();
  }

  showReport () {
    const parent = this.element;
    const docId = getDocIdFromPathname(window.location.pathname);
    const report = this.ui.createReport({parent, docId});
    return report;
  }
}

module.exports = Pane;
