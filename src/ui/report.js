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

function getHtml (docId, href, types, metadatas, t, tk) {
  const typesHtml = types.map((type) => `
    <div class="checklist-statements-${type.id} checklist-statements-group">
      <h3>${tk(type.name)}</h3>
      <ul></ul>
    </div>
  `).join("\n");

  const metadatasDiv = metadatas ? `<div class="checklist-report-metadatas">${metadatas}</div>` : "";

  const html = `
    <div class="checklist-report" data-checklist-doc-id="${docId}" data-checklist-href="${href}">
      <div class="checklist-report-header">
        ${metadatasDiv}
        <div class="checklist-report-rating">
          <div class="checklist-report-icon"></div>
          <div class="checklist-percentage"></div>
          <div class="checklist-rating-text"></div>
          <div class="checklist-report-rerun" data-checklist-action="report-run" title="${t("report-changed")}">
            <i class="fas fa-history"></i>
          </div>
        </div>
      </div>
      <div class="checklist-report-source-failed">
        ${t("report-source-failed", {url: docId})}
        <button class="checklist-report-retry" data-checklist-action="report-run">${t("report-retry")}</button>
      </div>
      <div class="checklist-report-details">
        <div class="checklist-statements">
          ${typesHtml}
        </div>
        <div class="checklist-rejections">
          <a class="checklist-rejections-toggle checklist-toggle-open-parent checklist-icon-box" data-checklist-action="toggle-parent">
            <i class="fas fa-exclamation-circle"></i>
            <span>${t("report-tests-failed")}</span>
          </a>
          <ul class="checklist-rejections-list checklist-collapsed"></ul>
        </div>
      </div>
    </div>
  `;
  return html;
}

class Report extends View {
  constructor ({ ui, parent, docId, href, metadatas, context, showMarkers }) {
    super("Report", ui, parent);
    Object.assign(this, {docId, href, metadatas, context, showMarkers});
    this.init();
    this.triggerState("ready");
  }

  // CONSTRUCTOR METHODS
  // ===================

  init () {
    this.rejections = [];
    this.percentage = 0;
    this.checksCount = 0;
    const types = this.getConfig("types");
    const html = getHtml(this.docId, this.href, types, this.metadatas, this.ui.t, this.ui.tk);
    this.createView(html);
    // Attach report to element to use it in events
    this.element.report = this;
    this.updateView();
    return this;
  }

  // RESET & RERUN CHECKER
  // =====================

  reset () {
    this.emit("beforeReset");
    if (this.checker) {
      this.checker.removeAllListeners();
    }
    this.checker = null;
    this.clear().clearStates().init();
    this.triggerState("reset");
    return this;
  }

  rerun () {
    const docId = this.docId;
    const href = this.href;
    const context = this.context;
    this.reset();
    this.startProgress();
    const stopLoaderProgressSimulation = this.simulateLoaderProgress();
    return new Promise ((resolve, reject) => {
      checklist.whenState("ready").then(() => {
        checklist.run({docId, href, context, reloadSource: true})
          .then((checker) => {
            this.checker = checker;
            resolve();
          })
          .catch((err) => {
            this.triggerState("failed");
            reject(err); // avoid duplicate logging here
          })
          .finally(stopLoaderProgressSimulation);
      });
    });
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
      this.triggerState("run");
      this.startProgress();
    })
    .catch(console.error);

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

    this.countCheck(check);
    addToRejectionsView(check);
    this.injectStatements(check.statements);
  }

  countCheck (check) {
    const isDropped = typeof check.hasState === "function" ? check.hasState("dropped") : check.states.dropped === true;
    if (!isDropped) {
      this.checksCount++;
    }
    return this;
  }

  isSelf () {
    return this.checker ? this.checker.source.self : null;
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

      const li = `<li class="checklist-statement ${typeClass} ${filterClass} ${tagsClasses}"><span class="checklist-statement-msg">${countSpan} ${this.tk(statement.name)}</span></li>`;
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
          contents: "<i class='fas fa-search'></i>",
          action: "goto-next-marker"
        });
      }

      if (statement.description) {
        addButton({
          element,
          classname: "checklist-btn-help-show",
          contents: "<i class='fas fa-info-circle'></i>",
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
      // Link element to its statement in order to easily implement filters
      element.statement = statement;
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
    const html = `<span class="checklist-marker checklist-marker-type-${marker.type}" data-checklist-marker-name="${this.tk(marker.name)}"></span>`;
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
    const html = `<li class="checklist-rejection" title="${errMsg}"><i class="fas fa-bug"></i>  ${this.tk(ruleName)}</li>`;
    $ul.append(html);

    return this;
  }

  injectRejections (rejections) {
    oneByOne(rejections, this.injectRejection.bind(this));
    return this;
  }

  // PROGRESS
  // ========

  toggleSpinner (flag = true) {
    const $div = this.find(".checklist-report-icon");
    const html = flag ? svg.spinner : "";
    $div.html(html);
    return this;
  }

  startProgress () {
    this.toggleSpinner();

    const $el = this.find(".checklist-percentage");
    let displayedPercentage = this.isSelf() ? 0 : (this.percentage || 0);

    // Smooth increment (one by one)
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

  simulateLoaderProgress () {
    const timeout = this.getConfig("loaderTimeout", 10000);

    // In case of a timeout: first increase progress one by one during 50% time, then freeze during 50%, then fail
    const refreshDelay = timeout / (50 + 50);

    const intervalID = setInterval(() => {
      this.setProgress(true);
    }, refreshDelay);

    const clearFunc = (function (intervalId) {
      return () => clearInterval(intervalId);
    })(intervalID);
    return clearFunc;
  }

  setProgress (incrementLoaderProgress) {
    const loaderMaxProgress = 49;

    if (incrementLoaderProgress) {
      if (this.percentage >= loaderMaxProgress) return; // progress freezes here
      this.percentage += 1;
      return this;
    }

    if (this.checker == null) return this;
    const checker = this.checker;
    const total = checker.rules.length;
    const count = checker.checks.filter((check) => check.hasState("done")).length;

    if (this.isSelf()) {
      this.percentage = Math.floor((count / total) * 100);
    } else {
      this.percentage = Math.floor(loaderMaxProgress + (count / total) * (100 - loaderMaxProgress));
    }
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
    this.emit("beforeUpdateView");
    this.toggleStatementGroups();
    this.setProgress();
    this.emit("afterUpdateView");
    return this;
  }

  // RATING
  // ======
  updateRating () {
    const applyClassToHeader = (rating) => {
      const $header = this.find(".checklist-report-rating");
      $header.removeClass((index, classname) => {
        return (classname.match(/(^|\s)checklist-rating-\S+/g) || []).join(' ');
      });
      $header.addClass(`checklist-rating-${rating}`);
    };

    const setRatingIcon = (id) => {
      const $el = this.find(".checklist-report-icon");
      const rating = this.ui.getRating(id);
      const icon = rating.icon;
      $el.html(icon);
    };

    const setRatingText = (id) => {
      const rating = this.ui.getRating(id);
      const $el = this.find(".checklist-rating-text");
      const text = this.tk(rating.text);
      $el.html(text);
    };

    const visibleStatements = this.find(".checklist-statement:not(.hidden)")
    .map(function () {
      return this.statement;
    })
    .get();
    const computeRating = this.getConfig("computeRating");
    const rating = this.rating = computeRating(visibleStatements, this);
    applyClassToHeader(rating);
    setRatingIcon(rating);
    setRatingText(rating);
    this.triggerState("rated");
    return this;
  }

  // FILTERS
  // =======

  filterStatements (id, hidden = true) {
    const selector = `.checklist-statement-${id}`;
    const $elements = this.find(selector);
    $elements.toggleClass("hidden", hidden);
    this.toggleStatementGroups();
    this.updateRating();
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
      this.get$element().addClass("checklist-report-from-cache");
      const statements = [];
      record.checks.forEach((check) => {
        this.countCheck(check);
        if (check.states.rejected) {
          this.injectRejection({
            ruleName: check.name,
            errMsg: check.errMsg
          });
        } else {
          statements.push.apply(statements, check.statements);
        }
      });
      this.injectStatements(statements);
      this.updateRating();
    };

    if (this.hasState("done")) return this;
    const cache = this.ui.cache;
    const docId = this.docId;
    const record = cache.get(docId);
    if (record) {
      updateViewFromRecord(record);
      this.setState("fromCache", true);
      this.triggerState("done");
    }
    return record;
  }
}

module.exports = Report;
