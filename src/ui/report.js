const svg = require("./svg.json");
const View = require("./view.js");

function getHtml (docId, metadatas) {
  const metadatasDiv = metadatas ? `<div class="checklist-report-metadatas">${metadatas}</div>` : "";
  const html = `
    <div class="checklist-report" data-checklist-doc-id="${docId}">
      <div class="checklist-report-header">
        ${metadatasDiv}
        <div class="checklist-report-rating">
          <div class="checklist-report-icon"></div>
          <div class="checklist-percentage"></div>
          <div class="checklist-rating-text"></div>
          <div class="checklist-report-rerun" data-checklist-action="report-rerun" title="Ce rapport a été chargé depuis le cache. Cliquez pour le rafraîchir.">
            ${svg.history}
          </div>
        </div>
      </div>
      <div class="checklist-report-details">
        <div class="checklist-hidden-statements">
          <span class="checklist-icon-box">
            ${svg["eye-blocked"]}
            <span>
              <span class="checklist-hidden-count"></span>
              <a data-checklist-action="filters-clear">Afficher</a>
            </span>
          </span>
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
        <div class="checklist-rejections">
          <a class="checklist-rejections-toggle checklist-toggle-open-parent checklist-icon-box" data-checklist-action="toggle-parent">
            ${svg.notification}
            <span>Des tests ont échoué</span>
          </a>
          <ul class="checklist-rejections-list checklist-collapsed"></ul>
        </div>
      </div>
    </div>
  `;
  return html;
}

class Report extends View {
  constructor ({ ui, parent, docId, metadatas, buttonsCreator, computeRating, showMarkers }) {
    super("Report", ui, parent);
    Object.assign(this, {docId, metadatas, buttonsCreator, computeRating, showMarkers});
    this.init();
    this.triggerState("ready");
  }

  // CONSTRUCTOR METHODS
  // ===================

  init () {
    this.rejections = [];
    this.percentage = 0;
    const html = getHtml(this.docId, this.metadatas);
    this.createView(html);
    // Attach report to element to use it in events
    this.element.report = this;
    return this;
  }

  // RESET & RERUN CHECKER
  // =====================

  reset () {
    this.emit("beforeReset");
    if (this.checker) {
      this.checker.removeAllListeners();
    }
    return this.clear().clearStates().init();
  }

  rerun () {
    const href = this.docId;
    this.reset();
    checklist.whenState("ready").then(() => {
      checklist.run({href});
    });
    return this;
  }

// CHECKER & CHECKS
// ================

  connect (checker) {
    this.checker = checker;
    checker.report = this;

    // Connect checks that are already done
    checker.checks.forEach((check) => {
      if (!check.hasState("done")) return;
      this.addCheck(check);
    });

    // Connect future checks
    checker.on("check.done", (check) => {
      if (this.hasState("done")) return;
      this.addCheck(check);
    });

    checker.whenState("run").then(() => {
      this.startPercentage();
      this.showSpinner();
    });

    checker.on("done", () => {
      this.updateRating();
      this.toCache();
      this.triggerState("done");
    });
  }

  addCheck (check) {
    const addToRejectionsView = (check) => {
      if (!check.hasState("rejected")) return;
      const rejection = {
        ruleName: check.name,
        errMsg: check.errMsg
      };
      this.injectRejection(rejection);
      this.rejections.push(rejection);
    };

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
      const countSpan = (statement.count && statement.count > 1) ? `<span class="checklist-statement-count">${statement.count}</span>` : "";
      const type = statement.type;
      const typeClass = type ? `checklist-statement-type-${type}` : "";

      const tags = statement.tags;
      const tagsClasses = getTagsClasses(tags);

      const cache = this.ui.cache;
      const tagsFilters = getTagsFilters(tags);
      const isFiltered = cache.isFiltered([`type-${type}`, ...tagsFilters]);
      const filterClass = isFiltered ? "hidden" : "";

      const li = `<li class="checklist-statement ${typeClass} ${filterClass} ${tagsClasses}"><span class="checklist-statement-msg">${statement.name} ${countSpan}</span></li>`;
      return li;
    };

    const addButton = ({element, classname, contents, action}) => {
      const html = `<button class="checklist-statement-btn ${classname}" data-checklist-action="${action}">${contents}</button>`;
      $(html).appendTo(element);
    };

    const addStatementButtons = (statement, element) => {
      if (this.showMarkers !== false && statement.markers && statement.markers.length > 0) {
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
    if (this.showMarkers === false) return;
    const html = `<span class="checklist-marker checklist-marker-type-${marker.type}" data-checklist-marker-name="${marker.name}"></span>`;
    const $element = $(html);
    const $filteredTarget = $(marker.target).filter(":not(.checklist-component *)");
    if (marker.position !== "after") {
        $element.prependTo($filteredTarget);
    } else {
        $element.appendTo($filteredTarget);
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

  injectRejection (rejection) {
    const {ruleName, errMsg} = rejection;

    const $container = this.find(".checklist-rejections");
    $container.addClass("visible");

    const $ul = this.find(".checklist-rejections-list");
    const html = `<li class="checklist-rejection" title="${errMsg}">${svg.bug}  ${ruleName}</li>`;
    $ul.append(html);

    return this;
  }

  injectRejections (rejections) {
    if (rejections == null) return this;
    if (!Array.isArray(rejections)) {
      rejections = [rejections];
    }
    rejections.forEach(this.injectRejection.bind(this));
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

    const intervalId = setInterval(() => {
      // Don't show 0%
      if (displayedPercentage === 0) {
        $el.empty();
      }
      // Clear interval when done
      if (this.hasState("done") || displayedPercentage >= 100) {
        $el.empty();
        clearInterval(intervalId);
        return;
      }
      if (displayedPercentage >= this.percentage) return;
      displayedPercentage++;
      $el.text(`${displayedPercentage}%`);
    }, 10);

    return this;
  }

  setPercentage () {
    const checker = this.checker;
    const total = checker.rules.length;
    const count = checker.indicators.checks.done;
    this.percentage = (count / total) * 100;
    return this;
  }

  // INDICATORS
  // ==========

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
  updateRating () {
    const applyClassToHeader = (rating) => {
      const $header = this.find(".checklist-report-rating");
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

    const rating = this.rating = this.computeRating(this.checker);
    applyClassToHeader(rating);
    setRatingIcon(rating);
    setRatingText(rating);
    this.triggerState("rating");
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
    this.toggleStatementGroups();
    this.updateHiddenCount();
    return this;
  }

  updateHiddenCount () {
    const getText = (hiddenCount) => {
      if (hiddenCount === 0) return "";
      const s = hiddenCount === 1 ? "" : "s";
      return `${hiddenCount} notification${s} masquée${s}.`;
    };

    const hiddenCount = this.find(".checklist-statement.hidden").length;
    const $div = this.find(".checklist-hidden-statements");
    const $span = this.find(".checklist-hidden-count");
    $div.toggleClass("visible", hiddenCount > 0);
    const text = getText(hiddenCount);
    $span.text(text);
    return this;
  }

  // CACHE
  // =====

  toCache () {
    const cache = this.ui.cache;
    cache.setRecord(this);
    return this;
  }

  fromCache () {
    const updateViewFromRecord = (record) => {
      const {rejections, indicators, states, statements} = record;
      Object.assign(this, {rejections, indicators, states});
      this.injectStatements(statements, false);
      this.injectRejections(rejections);
      this.updateRating();
    };

    if (this.hasState("done")) return this;
    const cache = this.ui.cache;
    const docId = this.docId;
    const record = cache.getRecord(docId);
    if (record == null) return false;
    this.get$element().addClass("checklist-report-from-cache");
    updateViewFromRecord(record);
    return this;
  }
}

module.exports = Report;
