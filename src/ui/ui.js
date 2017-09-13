const Base = require("../base.js");
const cache = require("./cache.js");
const Help = require("./help.js");
const initActions = require("./actions.js");
const Pane = require("./pane.js");
const Report = require("./report.js");
const Settings = require("./settings.js");
const TOC = require("./toc.js");

class UI extends Base {
  constructor ({ caller }) {
    super("UI", caller);
    this.components = {};
    this.reports = {};
    this.triggerState("ready");
  }

  // FIXME: not consistent with other checklist components
  init ({parent, buttonsCreator, publi}) {
    Object.assign(this, {parent, buttonsCreator});
    this.createComponents(publi);
    initActions(this);
    this.show();
    this.triggerState("initialized");
  }

  createComponents (publi) {
    const options = {ui: this, parent: this.parent};
    const isPubli = publi && publi.title && publi.toc && publi.toc.length > 0;
    if (isPubli) {
      options.publi = publi;
      this.components.toc = new TOC(options);
    }
    this.components.pane = new Pane(options);
    this.components.settings = new Settings(options);
    this.components.help = new Help(options);
    return this;
  }

  filterStatements (id, hidden = true) {
    this.forEachReport((report) => {
      report.filterStatements(id, hidden);
    });
    cache.setFilter(id, hidden);
    return this;
  }

  clearFilters () {
    this.forEachReport((report) => report.clearFilters());
    this.components.settings.clearFilters();
    cache.clearFilters();
    return this;
  }

  clearCache () {
    cache.clear();
  }

  createReport (options) {
    const report = new Report({
      ui: this,
      parent: options.parent,
      docId: options.docId,
      buttonsCreator: options.buttonsCreator || this.buttonsCreator
    });
    this.reports[options.docId] = report;
    return report;
  }

  getReport (docId) {
    return this.reports[docId];
  }

  forEachReport (fn) {
    const reports = this.reports;
    Object.keys(reports).forEach((docId) => {
      fn(reports[docId], docId);
    });
    return this;
  }

  connectChecker (checker) {
    const docId = checker.docId;
    const report = this.getReport(docId);
    if (!report) {
      throw Error(`Report not found for ${docId}`);
    }
    report.connect(checker);
    return this;
  }

  addBodyClass (classname) {
    $(document.body).addClass(classname);
  }

  removeBodyClass (classname) {
    $(document.body).removeClass(classname);
  }

  toggleBodyClass (classname, state) {
    $(document.body).toggleClass(classname, state);
  }

  hide () {
    this.removeBodyClass("checklist-visible");
    this.setState("visible", false);
    this.emit("hidden");
    return this;
  }

  show () {
    this.addBodyClass("checklist-visible");
    this.triggerState("visible");
    return this;
  }

  showToc () {
    this.toggleToc(true);
    return this;
  }

  hideToc () {
    this.toggleToc(false);
    return this;
  }

  toggleToc (flag) {
    const toc = this.components.toc;
    if (!toc) return;
    if (flag !== false) {
      toc.runUnchecked();
    }
    toc.toggle(flag);
    return this;
  }

  refreshToc () {
    const toc = this.components.toc;
    if (!toc) return;
    toc.rerunAll();
  }

  showChildpane (name) {
    const components = this.components;
    for (let key in components) {
      const component = components[key];
      if (!component.childpane) continue;
      component.toggle(key === name);
    }
    return this;
  }

  hideChildpanes () {
    this.showChildpane();
    return this;
  }

  showInfo (info) {
    this.components.help.setContent(info);
    this.showChildpane("help");
    return this;
  }

  hideInfo () {
    this.components.help.empty();
    this.hideChildpanes();
    return this;
  }
}

module.exports = UI;
