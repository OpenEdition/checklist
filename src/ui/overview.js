const View = require("./view.js");

function forEachChange (obj, prevObj, callback) {
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    if (prevObj[key] === value) return ;
    callback(key, value);
  });
}

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
          <div class="checklist-overview-progress">
            <div class="checklist-overview-progressbar"></div>
            <div class="checklist-overview-progresstext"></div>
          </div>
        </div>
        <div class="checklist-overview-section-run" data-display-condition="ongoing">
          <button class="checklist-toc-run" data-checklist-action="toc-run"><i class="fas fa-book"></i> ${this.t("toc-check")}</button>
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
      return `<li class="checklist-overview-stat-${rating.id}"></li>`;
    }).join("\n");
    $parent.html(statsHtml);
    return this;
  }

  reset () {
    this.prev = { states: {}, ratings: {} };
    this.find(".checklist-overview-stats li").empty();
    this.updateControls();
    return this;
  }

  update ({ states, ratings }) {
    this.updateControls(states)
        .updateProgress(states)
        .updateRatings(ratings)
        .updateErrors(states);
    this.prev = { states, ratings };
    return this;
  }

  updateControls (states = {}) {
    const done = states.done === states.length;
    const conditions = [
      {
        name: "started",
        flag: states.done > 0
      },
      {
        name: "ongoing",
        flag: !done
      },
      {
        name: "cache",
        flag: done && states.fromCache > 1
      }
    ];

    conditions.forEach(({name, flag}) => {
      const $el = this.find(`[data-display-condition='${name}']`);
      $el.toggleClass("visible", flag);
    });

    return this;
  }

  updateProgress (states) {
    const prevStates = this.prev.states;
    if (states.done === prevStates.done && states.length === prevStates.length) return this;

    const count = states.done;
    const total = states.length;
    const percent =  count / total * 100;
    const text = this.t("overview-documents", {count, total})
    this.find(".checklist-overview-progressbar").width(percent  + "%");
    this.find(".checklist-overview-progresstext").html(text);
    return this;
  }

  updateRatings (ratings) {
    forEachChange(ratings, this.prev.ratings, (key, value) => {
      const rating = this.ui.getRating(key);
      const icon = rating.icon;
      let $el = this.find(`.checklist-overview-stat-${key}`);
      $el.html(`${icon} ${value}`);
      $el.toggleClass("visible", value > 0);
    });
    return this;
  }

  updateErrors (states) {
    if (states.failed === this.prev.states.failed) return this;
    // TODO: display some notification in overview
    const length = states.failed.length;
    const text = length > 0 ? "Errors : " + length : "";
    this.find(".checklist-overview-errors").text(text);
    return this;
  }
}

module.exports = Overview;
