const Base = require("./base.js");
const Nanobar = require("nanobar");
const svg = require("./svg.json");

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
      <div class="checklist-rating"></div>
      <div class="checklist-indicators">
        <span class="checklist-indicator-checkcount"></span>
        <span class="checklist-indicator-checksuccess"></span>
        <span class="checklist-indicator-checkrejected"></span>
        <span class="checklist-indicator-statementcount"></span>
        <span class="checklist-indicator-statementinfo"></span>
        <span class="checklist-indicator-statementwarning"></span>
        <span class="checklist-indicator-statementdanger"></span>
      </div>
      <div class="checklist-progressbar"></div>
      <ul class="checklist-statements"></ul>
    </div>
  `;
  $(element).append(html);
}

// TODO: Add to documentation:
// types = danger, warning, info
// ratings = bad, good, perfect
function computeRating (indicators) {
  const {statementwarning, statementdanger} = indicators;
  if (statementdanger > 0) return "bad";
  if (statementwarning > 0) return "good";
  return "perfect";
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
      checkrejected: 0,
      statementcount: 0,
      statementinfo: 0,
      statementwarning: 0,
      statementdanger: 0
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

    // Display rating when checker done
    checker.on("done", () => {
      this.updateRating();
    });
  }

  setIndicator (key, value) {
    this.indicators[key] = value;
    return this;
  }

  incrementIndicator (key, nb = 1) {
    this.indicators[key] = (this.indicators[key] || 0) + nb;
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
        const type = statement.type;
        const typeClass = type ? `checklist-statement-type-${type}` : "";
        const li = `<li class="checklist-statement ${typeClass}">${statement.name} ${countSpan}</li>`;
        return li;
      };

      const injectStatement = (statement) => {
        const html = getStatementHtml(statement);
        $(target).append(html);
        const count = statement.count || 1;
        this.incrementIndicator("statementcount", count);
        this.incrementIndicator(`statement${statement.type}`, count);
        this.updateIndicatorsView();
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

  setIndicatorView (key, value) {
    const $el = this.find(`.checklist-indicator-${key}`);
    $el.text(value);
    return this;
  }

  updateRating () {
    const setRatingView = (rating) => {
      const $el = this.find(".checklist-rating");
      const html = svg[`rating-${rating}`];
      $el.html(html);
      return this;
    };

    const rating = computeRating(this.indicators);
    setRatingView(rating);
  }

  updateIndicatorsView () {
    const indicators = this.indicators;

    const updateProgressbar = () => {
      const {checkcount, checktotal} = indicators;
      const percentage = (checkcount / checktotal) * 100;
      this.progressbar.go(percentage);
    };

    const updateIndicators = () => {
      for (let key in indicators) {
        this.setIndicatorView(key, indicators[key]);
      }
    };

    updateProgressbar();
    updateIndicators();
    return this;
  }

}

module.exports = Report;
