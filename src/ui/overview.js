const View = require("./view.js");

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
        <div class="checklist-overview-section-run" data-display-condition="run-button">
          <button class="checklist-toc-run" data-checklist-action="toc-run"><i class="fas fa-book"></i> ${this.t("toc-check")}</button>
        </div>
        <div class="checklist-overview-section-running" data-display-condition="running">
          <p class="checklist-overview-running">${this.t("toc-control-running")}</p>
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

    const ratings = this.getConfig("ratings", []);
    const $parent = this.find(".checklist-overview-stats");
    const statsHtml = ratings.map((rating) => {
      return `<div class="checklist-overview-stat-${rating.id}"><div class= "checklist-overview-stat-tooltip"></div></div>`;
    }).join("");
    $parent.html(statsHtml);
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
        .updateRatings(states, ratings)
        .updateErrors(states);
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
    Object.keys(ratings).forEach((key) => {
      const value = ratings[key];
      if (prev.ratings[key] === value) return; // don't update if no change

      const total = states.length;
      const percent =  value / total * 100;
      const $el = this.find(`.checklist-overview-stat-${key}`);
      $el.width(`${percent}%`);

      const $tooltip = $el.find(".checklist-overview-stat-tooltip");
      if (value === 0) {
        $tooltip.removeClass("visible").empty();
        return;
      }
      const rating = this.ui.getRating(key);
      const icon = rating.icon;
      const contents = rating.icon + "&nbsp;" + value;
      $tooltip.html(contents).addClass("visible");
    });
    return this;
  }

  updateErrors (states) {
    if (this.failed === this.prev.states.failed) return this;
    const count = states.failed;
    const $el = this.find(".checklist-overview-errors");
    const flag = count > 0;
    const text = flag ? this.t("overview-error", {count}) : "";
    $el.toggleClass("visible", flag).text(text);
    return this;
  }
}

module.exports = Overview;
