const Base = require("./base.js");
const Nanobar = require("nanobar");
const svg = require("./svg.json");
const {escapeDoubleQuotes} = require("./utils.js");

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
      <div class="checklist-rating">${svg["rating-none"]}</div>
      <div class="checklist-progressbar"></div>
      <ul class="checklist-statements"></ul>
      <div class="checklist-rejections">
        <a class="checklist-rejections-toggle checklist-toggle-open-parent"><span class="checklist-indicator-checkrejected"></span> erreur(s) rencontrée(s)</a>
        <ul class="checklist-rejections-list checklist-collapsed"></ul>
      </div>
      <div class="checklist-indicators">
        <a class="checklist-rejections-toggle checklist-toggle-open-parent">Informations</a>
        <div class="checklist-collapsed">
          <p>
            <span class="checklist-indicator-checkcount"></span>&nbsp;vérification(s) effectuée(s), dont
            <span class="checklist-indicator-checksuccess"></span>&nbsp;réussie(s) et
            <span class="checklist-indicator-checkrejected"></span>&nbsp;abandonnée(s).
          </p>
          <p>
            <span class="checklist-indicator-statementcount"></span>&nbsp;notification(s) affichée(s), dont
            <span class="checklist-indicator-statementinfo"></span>&nbsp;information(s),
            <span class="checklist-indicator-statementwarning"></span>&nbsp;recommandation(s) et
            <span class="checklist-indicator-statementdanger"></span>&nbsp;alerte(s).
          </p>
        </div>
      </div>
    </div>
  `;
  $(element).append(html);
}

function initHandlers (report) {
  const $btn = report.find(".checklist-toggle-open-parent");
  $btn.each(function () {
    $(this).click(function () {
      $(this).parent().toggleClass("open");
    });
  });
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
    this.errMsgs = [];

    initHtml(this.docId, this.element);
    initHandlers(this);

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
    checker.report = this;
    
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
      const injectStatement = (statement) => {
        statement.inject(target);
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

    const addToRejectionsView = (check) => {
      if (!check.hasState("rejected")) return;

      const isDuplicateRejection = (msg) => {
        const escapedMsg = escapeDoubleQuotes(msg);
        const found = $ul.find(`li:contains("${escapedMsg}")`);
        return found.length > 0;
      };

      const $container = this.find(".checklist-rejections");
      $container.addClass("visible");

      const $ul = this.find(".checklist-rejections-list");
      const errMsg = check.errMsg;
      // TODO: add count sapn to count duplicate rejections
      if(isDuplicateRejection(errMsg)) return;

      const html = `<li class="checklist-rejection">${errMsg}</li>`;
      $ul.append(html);

      // Store errMsgs (without duplicates) in report
      this.errMsgs.push(errMsg);
    };

    addToIndicatorsView(check);
    addToRejectionsView(check);
    const target = this.find(".checklist-statements");
    injectStatements(check.statements, target);
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

    const setIndicatorView = (key, value) => {
      const $el = this.find(`.checklist-indicator-${key}`);
      $el.text(value);
      return this;
    };

    const updateIndicators = () => {
      for (let key in indicators) {
        setIndicatorView(key, indicators[key]);
      }
    };

    updateProgressbar();
    updateIndicators();
    return this;
  }

  export () {
    const {docId, indicators, states, errMsgs} = this;
    const obj = {docId, indicators, states, errMsgs};
    obj.statements = this.checker.statements.map((statement) => {
      return statement.export();
    });
    return obj;
  }
}

module.exports = Report;
