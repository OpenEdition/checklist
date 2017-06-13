const Base = require("./base.js");
const Nanobar = require("nanobar");

function createProgressbar (element) {
  return new Nanobar({
    target: element
  });
}

function createToolbar ({docId, element, buttonsCreator}) {
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
  const $toolbar = $(html).appendTo(element);
  const toolbar = $toolbar.get(0);
  return toolbar;
}

function initHtml (docId, element) {
  const html = `
    <div class="checklist-report" data-checklist-doc-id="${docId}">
      <div class="checklist-indicators">
        <span class="checklist-indicator-checkcount"></span>
        <span class="checklist-indicator-checksuccess"></span>
        <span class="checklist-indicator-checkrejected"></span>
      </div>
      <div class="checklist-progressbar"></div>
      <ul class="checklist-statements"></ul>
    </div>
  `;
  $(element).append(html);
}

class Report extends Base {
  constructor ({ caller, docId, element, buttonsCreator }) {
    super("Report", caller);
    this.docId = docId; // TODO: self ?
    this.element = element;
    initHtml(this.docId, this.element);

    const progressbarDiv = this.find(".checklist-progressbar").get(0);
    this.progressbar = createProgressbar(progressbarDiv);
    this.toolbar = createToolbar({docId, element, buttonsCreator});

    this.clearIndicators();
    this.triggerState("ready");
  }

  find (selector) {
    return $(this.element).find(selector);
  }

  clearIndicators () {
    this.indicators = {
      checkcount: 0,
      checktotal: 0,
      checksuccess: 0,
      checkrejected: 0
    };
    this.updateIndicatorsView();
    return this;
  }

  connect (checker) {
    this.checker = checker;
    const checktotal = checker.rules.length;
    this.setIndicator("checktotal", checktotal);

    // Connect checks that are already done
    checker.checks.forEach((check) => {
      if (!check.hasState("done")) return;
      this.addCheck(check);
    });

    // Connect future checks
    checker.on("check.done", (check) => {
      this.addCheck(check);
    });
  }

  setIndicator (key, value) {
    this.indicators[key] = value;
    return this;
  }

  incrementIndicator (key) {
    this.indicators[key]++;
    return this;
  }

  addCheck (check) {
    const addToIndicatorsView = (check) => {
      const getState = (check) => {
        const done = check.hasState("done");
        const success = check.hasState("success");
        const rejected = check.hasState("rejected");
        if (!done) throw Error("Check is not done");
        if (success === rejected) throw Error("Check state is not valid");
        return success ? "checksuccess" : "checkrejected";
      };

      const state = getState(check);
      this.incrementIndicator(state);
      this.incrementIndicator("checkcount");
      this.updateIndicatorsView();
    };

    const injectStatements = (statements, target) => {
      const getStatementHtml = (statement) => {
        const countSpan = (statement.count && statement.count > 1) ? `<span class="checklist-count">${statement.count}</span>` : "";
        const li = `<li class="checklist-statement">${statement.name} ${countSpan}</li>`;
        return li;
      };

      const injectStatement = (statement) => {
        const html = getStatementHtml(statement);
        $(target).append(html);
      };

      if (!Array.isArray(statements)) {
        statements = [statements];
      }
      statements.forEach(injectStatement);
    };

    addToIndicatorsView(check);
    const target = this.find(".checklist-statements");
    injectStatements(check.statements, target);
  }

  updateIndicator (key, value) {
    const span = this.find(`.checklist-indicator-${key}`);
    span.text(value);
    return this;
  }

  updateIndicatorsView () {
    const indicators = this.indicators;
    const {checkcount, checktotal} = indicators;
    const percentage = (checkcount / checktotal) * 100;
    this.progressbar.go(percentage);
    for (let key in indicators) {
      this.updateIndicator(key, indicators[key]);
    }
    return this;
  }

}

module.exports = Report;
