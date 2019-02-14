const View = require("./view.js");
const svg = require("./svg.json");

class Overview extends View {
  constructor ({ ui, parent }) {
    super("Overview", ui, parent);
    this.prev = { states: {}, ratings: {} };
    this.createMarkup();
    ui.on("filterStatements", () => this.reset());
  }

  createMarkup () {
    const html = `
      <div id="checklist-overview" class="checklist-overview">
        <div class="checklist-overview-section-info">
          <p class="checklist-overview-info">${this.t("toc-control-info")}</p>
        </div>
        <div class="checklist-overview-section-indicators" data-display-condition="started">
          <div class="checklist-overview-stats"></div>
          <div class="checklist-overview-errors"></div>
        </div>
        <div class="checklist-overview-section-legend"></div>
        <div class="checklist-overview-section-run" data-display-condition="run-button">
          <button class="checklist-toc-run" data-checklist-action="toc-run"><i class="fas fa-book"></i> ${this.t("toc-check")}</button>
        </div>
        <div class="checklist-overview-section-running" data-display-condition="running">
            <p class="checklist-overview-running">${svg.spinner} ${this.t("toc-control-running")}</p>
        </div>
        <div class="checklist-overview-section-done" data-display-condition="done">
          <p class="checklist-overview-done">${this.t("toc-control-done")}</p>
        </div>
        <div class="checklist-overview-section-cache" data-display-condition="cache">
          <p class="checklist-overview-info">${this.t("toc-control-info-cache")}</p>
          <button class="checklist-toc-rerun" data-checklist-action="toc-rerun"><i class="fas fa-history"></i> ${this.t("toc-rerun")}</button>
        </div>
      </div>
    `;
    this.createView(html);

    // Stats
    const ratings = this.getConfig("ratings", []);

    const $stats = this.find(".checklist-overview-stats");
    const statsHtml = ratings.map((rating) => {
      return `<div class="checklist-overview-stat-${rating.id}"><div class="checklist-overview-stat-tooltip"></div></div>`;
    }).join("");
    $stats.html(statsHtml);

    // Legend
    const $legend = this.find(".checklist-overview-section-legend");
    const legendDivs = ratings.map((rating) => {
      return `
        <div class="checklist-overview-legend-${rating.id}">
          <div class="checklist-overview-legend-icon">${rating.icon}</div>
          <div class="checklist-overview-legend-text">${this.tk(rating.text)}</div>
        </div>
      `;
    });
    const legendHtml = `<h3>${this.t("overview-legend-title")}</h3>` + legendDivs.join("");
    $legend.html(legendHtml);

    return this;
  }

  reset () {
    this.prev = { states: {}, ratings: {} };
    this.find(".checklist-overview-stats div").removeAttr("style");
    this.find(".checklist-overview-stat-tooltip").empty();
    this.updateControls();
    return this;
  }

  update ({ states, ratings }) {
    this.updateControls(states)
        .updateRatings(states, ratings);
    this.prev = { states, ratings };
    return this;
  }

  updateControls (states = {}) {
    const conditions = [
      {
        name: "started",
        flag: states.done > 0 || states.pending > 0
      },
      {
        name: "running",
        flag: states.pending > 0 || states.isBatchRunning
      },
      {
        name: "run-button",
        flag: states.fromCache === 0 && states.done < states.length && !states.isBatchRunning
      },
      {
        name: "cache",
        flag: states.fromCache > 0
      },
      {
        name:"done",
        flag: states.done === states.length && states.pending === 0 && !states.isBatchRunning
      }
    ];

    conditions.forEach(({name, flag}) => {
      const $el = this.find(`[data-display-condition='${name}']`);
      $el.toggleClass("visible", flag);
    });

    return this;
  }

  updateRatings (states, ratings) {
    const prev = this.prev;

    // "default" first
    if (states.blank + states.pending !== prev.states.blank + prev.states.pending) {
      this.updateRatingDiv("default", states.blank + states.pending, states.length);
    }

    // then "failed"
    if (states.failed !== prev.states.failed) {
      this.updateRatingDiv("failed", states.failed, states.length);
    }

    // other ratings finally
    Object.keys(ratings).forEach((key) => {
      if (key === "default" || key === "failed") return
      const value = ratings[key];
      if (prev.ratings[key] === value) return; // don't update if no change
      this.updateRatingDiv(key, value, states.length);
    });
    return this;
  }

  updateRatingDiv (name, count, total, icon) {
    const percent =  count / total * 100;
    const $el = this.find(`.checklist-overview-stat-${name}`);
    $el.width(`${percent}%`);

    const $legend = this.find(`.checklist-overview-legend-${name}`);
    $legend.toggleClass("visible", count > 0);

    const $tooltip = $el.find(".checklist-overview-stat-tooltip");
    if (count === 0) {
      $tooltip.removeClass("visible").empty();
      return;
    }

    icon = icon || this.ui.getRating(name).icon;
    const contents = icon + "&nbsp;" + count;
    $tooltip.html(contents).addClass("visible");
  }
}

module.exports = Overview;
