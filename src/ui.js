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
  init ({parent, buttonsCreator}) {
    const createPane = (parent) => {
      const html = `<div id="checklist-pane" class="checklist-pane"></div>`;
      const element = $(html).appendTo(parent).get(0);
      const docId = getDocIdFromPathname(window.location.pathname);
      // TODO: harmo arguments createReport et createToolbar
      // FIXME: ou alors il faut que ce soit dans le report ? => surement
      this.createReport({element, docId});
      this.createToolbar(docId, element);
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

    // FIXME: is it relevant to set this.parent here? And buttonsCreator?
    Object.assign(this, {parent, buttonsCreator});
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

  createToolbar (docId, target) {
    const buttonsCreator = this.buttonsCreator;
    if (typeof buttonsCreator !== "function") return;

    const getAttributes = (buttonInfos) => {
      const attributes = [];
      for (let attrName in buttonInfos) {
        attributes.push(`${attrName}="${buttonInfos[attrName]}"`);
      }
      return attributes.join(" ");
    };

    const getButtonsHtml = (buttonsInfos) => {
      const buttons = buttonsInfos.map((buttonInfos) => {
        const attributes = getAttributes(buttonInfos);
        return `<a class="checklist-toolbar-button" ${attributes}>${buttonInfos.title}</a>`;
      });
      const html = buttons.join("\n");
      return html;
    };

    const buttonsInfos = buttonsCreator(docId);
    const html = getButtonsHtml(buttonsInfos);
    const $toolbar = $(html).appendTo(target);
    return $toolbar;
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
      this.createToolbar(docId, $element);
      $toc.append($element);
      const element = $element.get(0);
      this.createReport({element, docId});
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
