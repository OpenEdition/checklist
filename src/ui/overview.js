const View = require("./view.js");

class Overview extends View {
  constructor ({ ui, parent }) {
    super("Overview", ui, parent);

    this.length = 0;
    this.statsCount = 0;

    const html = `
      <div id="checklist-overview" class="checklist-overview">
        <div class="checklist-overview-stats"></div>
        <div class="checklist-overview-progress">
          <div class="checklist-overview-progressbar"></div>
          <div class="checklist-overview-progresstext"></div>
        </div>
        <div class="checklist-overview-control">
          <p class="checklist-overview-control-info">${this.t("toc-control-info")}</p>
          <p class="checklist-overview-control-info-cache">${this.t("toc-control-info-cache")}</p>
          <button class="checklist-toc-run" data-checklist-action="toc-run"><i class="fas fa-book"></i> ${this.t("toc-check")}</button>
          <button class="checklist-toc-rerun" data-checklist-action="toc-rerun"><i class="fas fa-history"></i> ${this.t("toc-rerun")}</button>
        </div>
      </div>
    `;
    this.createView(html);
    this.reset();

    ui.on("filterStatements", () => this.reset());
  }

  addStat (name, nb = 1) {
    if (typeof name !== "string" || nb === 0 || this.statsCount + nb > this.length || this.statsCount + nb < 0) return this;

    const value = this.stats[name] || 0;
    const newValue = value + nb < 0 ? 0 : value + nb;
    this.stats[name] = newValue;
    this.statsCount += nb;
    this.updateProgress();

    const rating = this.ui.getRating(name);

    if (rating == null) {
      throw Error(`Missing rating declaration for '${name}'`);
    };

    const icon = rating.icon;
    let $el = this.find(`.checklist-overview-stat-${name}`);
    $el.html(`${icon} ${newValue}`);
    $el.toggleClass("visible", newValue > 0);
    return this;
  }

  // TODO: just empty this html element on reset
  reset () {
    this.stats = {};

    const ratings = this.getConfig("ratings", []);
    const $parent = this.find(".checklist-overview-stats");
    const statsHtml = ratings.map((rating) => {
      return `<li class="checklist-overview-stat-${rating.id}"></li>`;
    }).join("\n");
    $parent.html(statsHtml);
    return this;
  }

  incrementLength () {
    this.length++;
  }

  updateProgress () {
    const count = this.statsCount;
    const total = this.length;
    const percent =  count / total * 100;
    const text = this.t("overview-documents", {count, total})
    this.find(".checklist-overview-progressbar").width(percent  + "%");
    this.find(".checklist-overview-progresstext").html(text);

  }
}

module.exports = Overview;
