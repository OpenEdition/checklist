const Base = require("./base.js");
const Nanobar = require("nanobar");

function createProgressBar (element) {
  return new Nanobar({
    target: element
  });
}

function initHtml (docId, element) {
  const html = `
    <div class="checklist-report" data-checklist-doc-id="${docId}">
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
  constructor ({ caller, docId, element }) {
    super("Report", caller);
    this.docId = docId; // TODO: self ?
    this.element = element;
    initHtml(this.docId, this.element);

    const progressDiv = this.find(".checklist-progress");
    this.progressBar = createProgressBar(progressDiv);

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
    // TODO: reprendre ici. Ici il faut handle les events du checker et mettre à jour le report en fonction
    this.checker = checker;
    const total = checker.rules.length;
    this.setTotalProgress(total);

    // TODO: make sure checker is connected before it runs! (especially in runBatch, not sure since it relies on batch.on("ready"))
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
    injectStatements(check.statements, this.element);
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
