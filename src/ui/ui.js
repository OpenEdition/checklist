const Base = require("../base.js");
const Cache = require("./cache.js");
const Help = require("./help.js");
const initActions = require("./actions.js");
const i18n = require("./i18n.js");
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
  init ({parent}) {
    this.parent = parent;
    this.publi = this.getConfig("publi");
    this.cache = new Cache({caller: this});
    this.initStyles();

    const lang = this.getConfig("lang");
    const translations = this.getConfig("translations");
    i18n({lang, translations}).then(({t, tk}) => {
      this.t = t;
      this.tk = tk;
      this.createComponents();
      initActions(this);
      this.show();
      this.triggerState("initialized");
    })
    .catch(console.error);
  }

  initStyles () {
    const styles = [];
    // Function to inject custom styles in page
    const injectStyles = (styles) => {
      const $styleTag = $("<style>").appendTo("head");
      if (styles == null) return;
      $styleTag.html(styles);
    };

    // Inject types related styles
    const types = this.getConfig("types");
    types.forEach((type) => {
      styles.push(`
        .checklist-statements-${type.id} ul {
          border-left: 5px solid ${type.color};
        }
      `);
    });

    // Inject ratings related styles
    const ratings = this.getConfig("ratings");
    ratings.forEach((rating) => {
      styles.push(`
        .checklist-rating-${rating.id}, .checklist-overview-stat-${rating.id}, .checklist-overview-stat-${rating.id} .checklist-overview-stat-tooltip {
          color: ${rating.color};
          fill: ${rating.color};
          background-color: ${rating.bgcolor};
        }
        .checklist-overview-stat-${rating.id} .checklist-overview-stat-tooltip:after {
          border-top-color: ${rating.bgcolor};
        }
      `);
    });

    // Inject custom styles
    const customStyles = this.getConfig("customStyles", []);
    injectStyles(styles.concat(customStyles).join("\n"));
  }

  createComponents () {
    const options = {ui: this, parent: this.parent, publi: this.publi};
    this.components.pane = new Pane(options);
    this.components.settings = new Settings(options);
    this.components.help = new Help(options);
    if (this.publi) {
      this.components.toc = new TOC(options);
    }
    return this;
  }

  filterStatements (id, hidden = true) {
    this.emit("filterStatements");
    this.forEachReport((report) => {
      report.filterStatements(id, hidden);
    });
    this.cache.setFilter(id, hidden);
    return this;
  }

  clearCache () {
    this.cache.clear();
  }

  createReport (options) {
    const report = new Report({
      ui: this,
      parent: options.parent,
      docId: options.docId,
      href: options.href,
      metadatas: options.metadatas,
      context: options.context,
      showMarkers: this.publi ? false : true,
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

  runToc (rerunAll) {
    const toc = this.components.toc;
    if (!toc) return;
    return rerunAll === true ? toc.rerunAll().focus() : toc.rerunUnchecked().focus();
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

  getRating (id) {
    const ratings = this.getConfig("ratings", []);
    const rating = ratings.find((rating) => rating.id === id);
    if (rating == null) {
      // TODO: gerer les erreur comme ça partout
      const err = new Error(`Missing rating declaration for '${name}'`);
      this.emit("error", err);
    };
    return rating;
  }
}

module.exports = UI;
