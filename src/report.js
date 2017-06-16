const Base = require("./base.js");
const cache = require("./cache.js");
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
      this.toCache();
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

  injectStatement (statement, increment = true) {
    const injectMarker = (marker) => {
      const html = `<span class="checklist-marker checklist-marker-type-${marker.type}" data-checklist-marker-name="${marker.name}"></span>`;
      const $element = $(html);
      if (marker.position !== "after") {
          $element.prependTo(marker.target);
      } else {
          $element.appendTo(marker.target);
      }
      marker.setElement($element.get(0));
    };

    const injectMarkers = () => {
      if (!statement.markers) return;
      statement.markers.forEach((marker) => {
        injectMarker(marker);
      });
    };

    const getHtml = () => {
      const countSpan = (statement.count && statement.count > 1) ? `<span class="checklist-count">${statement.count}</span>` : "";
      const type = statement.type;
      const typeClass = type ? `checklist-statement-type-${type}` : "";
      const li = `<li class="checklist-statement ${typeClass}">${statement.name} ${countSpan}</li>`;
      return li;
    };

    const scrollToNextMarkerHandler = () => {
      const markers = statement.markers;
      if (!markers || markers.length === 0) return;

      const winPos = $(window).scrollTop();
      const isBottomReached = winPos + $(window).height() > $(document).height() - 50;
      const tops = markers.map((marker) => {
        return $(marker.element).offset().top;
      });
      const nextTop = tops.find((top) => {
        return top > winPos + 10;
      });

      if (!isBottomReached && nextTop) {
        return $(window).scrollTop(nextTop);
      }
      $(window).scrollTop(tops[0]);
    };

    const doInject = (statement, target) => {
      injectMarkers();
      const html = getHtml();
      const $element = $(html);
      $element.click(scrollToNextMarkerHandler);
      $(target).append($element);
    };

    const target = this.find(".checklist-statements");
    doInject(statement, target);
    const count = statement.count || 1;
    if (increment) {
      this.incrementIndicator("statementcount", count);
      this.incrementIndicator(`statement${statement.type}`, count);
      this.updateIndicatorsView();
    }
    return this;
  }

  injectStatements (statements, increment) {
    if (!Array.isArray(statements)) {
      statements = [statements];
    }
    statements.forEach((statement) => {
      this.injectStatement(statement, increment);
    });
    return this;
  }

  injectRejection (errMsg) {
    const isDuplicateRejection = (msg, container) => {
      const escapedMsg = escapeDoubleQuotes(msg);
      const found = $(container).find(`li:contains("${escapedMsg}")`);
      return found.length > 0;
    };

    const doInject = (errMsg, target) => {
      const $container = this.find(".checklist-rejections");
      $container.addClass("visible");
      const html = `<li class="checklist-rejection">${errMsg}</li>`;
      $(target).append(html);
    };

    // TODO: add count span to count duplicate rejections
    const $container = this.find(".checklist-rejections-list");
    if(isDuplicateRejection(errMsg, $container)) return;
    doInject(errMsg, $container);
    return this;
  }

  injectRejections (errMsgs) {
    if (!Array.isArray(errMsgs)) {
      errMsgs = [errMsgs];
    }
    errMsgs.forEach(this.injectRejection.bind(this));
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

    const addToRejectionsView = (check) => {
      if (!check.hasState("rejected")) return;
      const errMsg = check.errMsg;
      this.injectRejection(errMsg);
      // Store errMsgs (without duplicates) in report
      this.errMsgs.push(errMsg);
    };

    addToIndicatorsView(check);
    addToRejectionsView(check);
    this.injectStatements(check.statements);
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

  toCache () {
    cache.setRecord(this);
    return this;
  }

  fromCache () {
    const updateViewFromRecord = (record) => {
      const {errMsgs, indicators, states, statements} = record;
      Object.assign(this, {errMsgs, indicators, states});
      this.injectStatements(statements, false);
      this.injectRejections(errMsgs);
      this.updateIndicatorsView();
      this.updateRating();
    };

    const docId = this.docId;
    const record = cache.getRecord(docId);
    if (record == null) return;
    updateViewFromRecord(record);
    return this;
  }
}

module.exports = Report;
