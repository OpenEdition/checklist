const svg = require("./svg.json");
const View = require("./view.js");

function oneByOne (param, fn) {
  if (param == null) return;
  if (!Array.isArray(param)) {
    fn(param);
  } else {
    param.forEach(fn);
  }
}

function getHtml (docId, types, metadatas) {
  const typesHtml = types.map((type) => `
    <div class="checklist-statements-${type.id} checklist-statements-group">
      <h3>${type.name}</h3>
      <ul></ul>
    </div>
  `).join("\n");

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
        <div class="checklist-statements">
          ${typesHtml}
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
  constructor ({ ui, parent, docId, metadatas, showMarkers }) {
    super("Report", ui, parent);
    Object.assign(this, {docId, metadatas, showMarkers});
    this.init();
    this.triggerState("ready");
  }

  // CONSTRUCTOR METHODS
  // ===================

  init () {
    this.rejections = [];
    this.percentage = 0;
    const types = this.getConfig("types");
    const html = getHtml(this.docId, types, this.metadatas);
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

  injectStatement (statement) {
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

  injectStatements (statements) {
    oneByOne(statements, this.injectStatement.bind(this));
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
    oneByOne(markers, this.injectMarker.bind(this));
  }

  // REJECTIONS
  // ==========

  injectRejection ({ruleName, errMsg}) {
    const $container = this.find(".checklist-rejections");
    $container.addClass("visible");

    const $ul = this.find(".checklist-rejections-list");
    const html = `<li class="checklist-rejection" title="${errMsg}">${svg.bug}  ${ruleName}</li>`;
    $ul.append(html);

    return this;
  }

  injectRejections (rejections) {
    oneByOne(rejections, this.injectRejection.bind(this));
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
    // If no checker, then process is 100%
    if (this.checker == null) {
      this.percentage = 100;
      return this;
    }
    const checker = this.checker;
    const total = checker.rules.length;
    // FIXME: indicators still usefull ?
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
    return this;
  }

  // RATING
  // ======
  updateRating (statements = this.checker.getStatements()) {
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

    const computeRating = this.getConfig("computeRating");
    const rating = this.rating = computeRating(statements);
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
    return this;
  }

  // CACHE
  // =====

  toCache () {
    const cache = this.ui.cache;
    const docId = this.docId;
    const record = this.checker.export();
    cache.set(docId, record);
    return this;
  }

  fromCache () {
    const updateViewFromRecord = (record) => {
      if (record == null) return false;
      this.get$element().addClass("checklist-report-from-cache");
      const statements = [];
      record.checks.forEach((check) => {
        if (check.states.rejected) {
          this.injectRejection({
            ruleName: check.name,
            errMsg: check.states.rejected
          });
        } else {
          statements.concat(check.statements);
        }
      });
      this.injectStatements(statements);
      this.updateRating(statements);
    };

    if (this.hasState("done")) return this;
    const cache = this.ui.cache;
    const docId = this.docId;
    const record = cache.get(docId);
    updateViewFromRecord(record);
    return this;
  }
}

module.exports = Report;
