const Base = require("./base.js");
const Nanobar = require("nanobar");

function createProgressBar (element) {
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
      <div class="checklist-progressbar"></div>
      <div class="checklist-progress">
        <span class="checklist-progress-count"></span>
        <span class="checklist-progress-total"></span>
        <span class="checklist-progress-success"></span>
        <span class="checklist-progress-rejected"></span>
      </div>
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

    const progressBarDiv = this.find(".checklist-progressbar").get(0);
    this.progressBar = createProgressBar(progressBarDiv);
    this.toolBar = createToolbar({docId, element, buttonsCreator});

    this.clearProgress();
    this.triggerState("ready");
  }

  find (selector) {
    return $(this.element).find(selector);
  }

  clearProgress () {
    this.progress = {
      count: 0,
      success: 0,
      rejected: 0,
      total: 0
    };
    this.updateProgressView();
    return this;
  }

  connect (checker) {
    this.checker = checker;
    const total = checker.rules.length;
    this.setTotalProgress(total);

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

  setTotalProgress (total) {
    this.progress.total = total;
    return this;
  }

  addCheck (check) {
    const addToProgressView = (check) => {
      const getState = (check) => {
        const done = check.hasState("done");
        const success = check.hasState("success");
        const rejected = check.hasState("rejected");
        if (!done) throw Error("Check is not done");
        if (success === rejected) throw Error("Check state is not valid");
        return success ? "success" : "rejected";
      };

      const state = getState(check);
      this.progress[state]++;
      this.progress.count++;
      this.updateProgressView();
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

    addToProgressView(check);
    const target = this.find(".checklist-statements");
    injectStatements(check.statements, target);
  }

  updateIndicator (key, value) {
    const span = this.find(`.checklist-progress-${key}`);
    span.text(value);
    return this;
  }

  updateProgressView () {
    const progress = this.progress;
    const {count, total} = progress;
    const percentage = (count / total) * 100;
    this.progressBar.go(percentage);
    for (let key in progress) {
      this.updateIndicator(key, progress[key]);
    }
    return this;
  }

}

module.exports = Report;
