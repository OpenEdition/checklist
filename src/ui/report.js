const cache = require("./cache.js");
const svg = require("./svg.json");
const View = require("./view.js");
const {escapeDoubleQuotes} = require("../utils.js");

function getHtml (docId) {
  const html = `
    <div class="checklist-report" data-checklist-doc-id="${docId}">
      <div class="checklist-report-header">
        <div class="checklist-report-icon"></div>
        <div class="checklist-percentage"></div>
        <div class="checklist-rating-text"></div>
      </div>
      <div class="checklist-statements">
        <div class="checklist-statements-danger checklist-statements-group">
          <h3>Avertissements</h3>
          <ul></ul>
        </div>
        <div class="checklist-statements-warning checklist-statements-group">
          <h3>Recommandations</h3>
          <ul></ul>
        </div>
        <div class="checklist-statements-info checklist-statements-group">
          <h3>Informations</h3>
          <ul></ul>
        </div>
      </div>
      <div class="checklist-hidden-statements"><span class="checklist-hidden-count"></span> masquée(s)<a data-checklist-action="filters-clear">[Supprimer les filtres]</a></div>
      <div class="checklist-rejections">
        <a class="checklist-rejections-toggle checklist-toggle-open-parent" data-checklist-action="toggle-parent">Des erreurs ont été rencontrées</a>
        <ul class="checklist-rejections-list checklist-collapsed"></ul>
      </div>
    </div>
  `;
  return html;
}

class Report extends View {
  constructor ({ ui, docId, parent, buttonsCreator }) {
    super("Report", ui, parent);
    this.docId = docId;
    this.buttonsCreator = buttonsCreator;
    this.errMsgs = [];
    this.percentage = 0;

    const html = getHtml(docId, parent);
    this.createView(html);
    this.toolbar = this.createToolbar();

    this.clearIndicators();
    this.triggerState("ready");
  }

  // CONSTRUCTOR METHODS
  // ===================

  createToolbar () {
    if (typeof this.buttonsCreator !== "function") return;

    const getButtonAttributes = (buttonInfos) => {
      const attributes = [];
      for (let attrName in buttonInfos) {
        attributes.push(`${attrName}="${buttonInfos[attrName]}"`);
      }
      return attributes.join(" ");
    };

    const getButtonsHtml = (buttonsInfos) => {
      const buttons = buttonsInfos.map((buttonInfos) => {
        const attributes = getButtonAttributes(buttonInfos);
        return `<a class="checklist-toolbar-button" ${attributes}>${buttonInfos.title}</a>`;
      });
      const html = buttons.join("\n");
      return html;
    };

    const buttonsInfos = this.buttonsCreator(this.docId);
    const html = getButtonsHtml(buttonsInfos);
    const $toolbar = $(html).appendTo(this.element);
    const toolbar = $toolbar.get(0);
    return toolbar;
  }

  // CHECKER & CHECKS
  // ================

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

    checker.whenState("run").then(() => {
      this.startPercentage();
      this.showSpinner();
    });

    checker.on("done", () => {
      this.updateRating();
      this.toCache();
    });
  }

  addCheck (check) {
    const getCheckState = (check) => {
      const done = check.hasState("done");
      const success = check.hasState("success");
      const rejected = check.hasState("rejected");
      if (!done) throw Error("Check is not done");
      if (success === rejected) throw Error("Check state is not valid");
      return success ? "checksuccess" : "checkrejected";
    };

    const addToIndicatorsView = (check) => {
      const state = getCheckState(check);
      this.incrementIndicator(state);
      this.incrementIndicator("checkcount");
      this.updateView();
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

  // STATEMENTS
  // ==========

  injectStatement (statement, increment = true) {
    const getTagsClasses = (tags = []) => {
      return tags.map((tag) => `checklist-statement-tag-${tag}`).join(" ");
    };

    const getTagsFilters = (tags = []) => {
      return tags.map((tag) => `tag-${tag}`);
    };

    const getStatementHtml = () => {
      const countSpan = (statement.count && statement.count > 1) ? `<span class="checklist-count">${statement.count}</span>` : "";
      const type = statement.type;
      const typeClass = type ? `checklist-statement-type-${type}` : "";

      const tags = statement.tags;
      const tagsClasses = getTagsClasses(tags);

      const tagsFilters = getTagsFilters(tags);
      const isFiltered = cache.isFiltered([`type-${type}`, ...tagsFilters]);
      const filterClass = isFiltered ? "hidden" : "";

      const li = `<li class="checklist-statement ${typeClass} ${filterClass} ${tagsClasses}">${statement.name} ${countSpan}</li>`;
      return li;
    };

    const addButton = ({element, classname, contents, action}) => {
      const html = `<button class="checklist-statement-btn ${classname}" data-checklist-action="${action}">${contents}</button>`;
      $(html).appendTo(element);
    };

    const addStatementButtons = (statement, element) => {
      if (statement.markers && statement.markers.length > 0) {
        addButton({
          element,
          classname: "checklist-btn-goto-next-marker",
          contents: svg.search,
          action: "goto-next-marker"
        });
      }

      if (statement.description) {
        addButton({
          element,
          classname: "checklist-btn-help-show",
          contents: svg.help,
          action: "help-show"
        });
      }
    };

    const getGroup = (type) => this.find(`.checklist-statements-${type}`);

    const appendToGroup = (element, type = "info") => {
      const $group = getGroup(type);
      const $ul = $group.find("ul");
      $($ul).append(element);
    };

    const doInjectStatement = (statement, target) => {
      this.injectMarkers(statement.markers);
      const html = getStatementHtml();
      const element = $(html).get(0);
      addStatementButtons(statement, element);
      // Attach statement to element to use it in events
      element.statement = statement;
      appendToGroup(element, statement.type);
    };

    doInjectStatement(statement);
    const count = statement.count || 1;
    if (increment) {
      this.incrementIndicator("statementcount", count);
      this.incrementIndicator(`statement${statement.type}`, count);
    }
    this.updateView();
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

  // MARKERS
  // =======

  injectMarker (marker) {
    const html = `<span class="checklist-marker checklist-marker-type-${marker.type}" data-checklist-marker-name="${marker.name}"></span>`;
    const $element = $(html);
    if (marker.position !== "after") {
        $element.prependTo(marker.target);
    } else {
        $element.appendTo(marker.target);
    }
    marker.setElement($element.get(0));
  }

  injectMarkers (markers) {
    if (!markers) return;
    markers.forEach((marker) => {
      this.injectMarker(marker);
    });
  }

  // REJECTIONS
  // ==========

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

  // PROGRESS
  // ========

  showSpinner () {
    const $div = this.find(".checklist-report-icon");
    $div.html(svg.spinner);
    return this;
  }

  startPercentage () {
    const $el = this.find(".checklist-percentage");
    let displayedPercentage = 0;

    const updateView = (percentage) => {
      if (percentage <= 0 || percentage >= 100) {
        return $el.empty();
      }
      $el.text(`${percentage}%`);
    };

    const intervalId = setInterval(() => {
      if (displayedPercentage >= this.percentage) return;
      updateView(++displayedPercentage);
      if (displayedPercentage >= 100) {
        clearInterval(intervalId);
      }
    }, 10);

    return this;
  }

  setPercentage () {
    const {checkcount, checktotal} = this.indicators;
    this.percentage = (checkcount / checktotal) * 100;
    return this;
  }

  // INDICATORS
  // ==========

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
    this.updateView();
    return this;
  }

  setIndicator (key, value) {
    this.indicators[key] = value;
    return this;
  }

  incrementIndicator (key, nb = 1) {
    this.indicators[key] = (this.indicators[key] || 0) + nb;
    return this;
  }

  toggleStatementGroups () {
    const $groups = this.find(".checklist-statements-group");
    $groups.each(function () {
      const isUnused = $(this).find("li:not(.hidden)").length === 0;
      $(this).toggleClass("hidden", isUnused);
    });
  }

  updateView () {
    this.toggleStatementGroups();
    this.setPercentage();
    this.updateHiddenCount();
    return this;
  }

  // RATING
  // ======

  // TODO: Add to documentation:
  // types = danger , warning , info
  // ratings = bad, good, excellent
  computeRating () {
    const {statementwarning, statementdanger} = this.indicators;
    if (statementdanger > 0) return "bad";
    if (statementwarning > 0) return "good";
    return "excellent";
  }

  updateRating () {
    const applyClassToHeader = (rating) => {
      const $header = this.find(".checklist-report-header");
      $header.addClass(`checklist-rating-${rating}`);
    };

    const setRatingIcon = (rating) => {
      const $el = this.find(".checklist-report-icon");
      const html = svg[`rating-${rating}`];
      $el.html(html);
    };

    const setRatingText = (rating) => {
      const texts = {
        bad: "Ce document contient des erreurs de composition.",
        good: "Ce document est correctement composé.",
        excellent: "Ce document est très bien composé."
      };
      const $el = this.find(".checklist-rating-text");
      const html = texts[rating];
      $el.html(html);
    };

    const rating = this.computeRating();
    applyClassToHeader(rating);
    setRatingIcon(rating);
    setRatingText(rating);
    return this;
  }

  // FILTERS
  // =======

  filterStatements (id, hidden = true) {
    const selector = `.checklist-statement-${id}`;
    const $elements = this.find(selector);
    $elements.toggleClass("hidden", hidden);

    this.toggleStatementGroups();
    this.updateHiddenCount();
    return this;
  }

  clearFilters () {
    this.find(".checklist-statement.hidden").removeClass("hidden");
    this.updateHiddenCount();
    return this;
  }

  updateHiddenCount () {
    const hiddenCount = this.find(".checklist-statement.hidden").length;
    const $div = this.find(".checklist-hidden-statements");
    const $span = this.find(".checklist-hidden-count");
    if (hiddenCount === 0) {
      $div.removeClass("visible");
      $span.empty();
      return;
    }
    $div.addClass("visible");
    $span.text(hiddenCount);
    return this;
  }

  // CACHE
  // =====

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
