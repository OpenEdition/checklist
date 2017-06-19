const Base = require("./base.js");
const cache = require("./cache.js");
const Report = require("./report.js");
const { getDocIdFromPathname } = require("./utils.js");

// Load UI styles
require("./css/ui.css");

class UI extends Base {
  constructor ({ caller }) {
    super("UI", caller);
    this.reports = {};
    // TODO: load filters from cache
    this.filters = [];
    this.triggerState("ready");
  }

  // FIXME: not consistent with other checklist components
  init ({parent, buttonsCreator, toc}) {
    const createPane = (parent) => {
      const html = `<div id="checklist-pane" class="checklist-pane"></div>`;
      const element = $(html).appendTo(parent).get(0);
      const docId = getDocIdFromPathname(window.location.pathname);
      this.createReport({element, docId, buttonsCreator});
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

    const createConfigView = (parent) => {
      const getInputHtml = (filters) => {
        const inputs = filters.map((filter) => {
          const isHidden = this.getFilter(filter.id);
          const checkedAttr = isHidden ? "" : "checked";
          return `<input type="checkbox" class="checklist-filter" value="${filter.id}" ${checkedAttr}>${filter.name}</input>`;
        });
        return inputs.join("\n");
      };

      const inputHtml = getInputHtml([
        {id: "type-info", name: "Informations"},
        {id: "type-warning", name: "Recommandations"},
        {id: "type-danger", name: "Alertes"}
      ]);
      const html = `
        <div id="checklist-config-view" class="checklist-config-view">
          <h1>Configuration</h1>
          <h2>Filtres</h2>
          ${inputHtml}
        </div>
      `;
      const $element = $(html).appendTo(parent);

      // Handlers
      const inputHandler = (filterId, hidden) => {
        this.setFilter(filterId, !hidden);
      };

      $element.find(".checklist-filter").change(function () {
        const filterId = $(this).prop("value");
        const hidden = !$(this).prop("checked");
        inputHandler(filterId, hidden);
      });

      return $element.get(0);
    };

    // FIXME: is it relevant to set this.parent here? And buttonsCreator?
    Object.assign(this, {parent, buttonsCreator});
    this.pane = createPane(parent);
    this.configView = createConfigView(parent);
    if (toc) {
      this.tocView = createTocView(parent);
      this.copyToc(toc);
    }
    this.triggerState("initialized");
  }

  setFilter (id, visible = false) {
    const setStatementVisibility = (selector, visible = true) => {
      const $elements = $(selector);
      $elements.toggleClass("hidden", !visible);
    };

    const selector = `.checklist-statement-${id}`;
    setStatementVisibility(selector, visible);
    cache.set(`filter-${id}`, visible);
    return this;
  }

  // Return true if filter exists, i.e. statements must be hidden
  getFilter (id) {
    return cache.get(`filter-${id}`, false);
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
    const $toc = $("#checklist-toc");
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
      const buttonsCreator = this.buttonsCreator;
      const report = this.createReport({element, docId, buttonsCreator});
      report.fromCache();
    });
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
}

module.exports = UI;
