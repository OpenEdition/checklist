const View = require("./view.js");

class Overview extends View {
  constructor ({ ui, parent }) {
    super("Overview", ui, parent);

    const html = `
      <div id="checklist-overview" class="checklist-overview">
        <div id="checklist-overview-stats" class="checklist-overview-stats"></div>
        <div id="checklist-overview-progress" class="checklist-overview-progress"></div>
        <div id="checklist-overview-control" class="checklist-overview-control">
          <p class="checklist-overview-control-info">${this.t("toc-control-info")}</p>
          <p class="checklist-overview-control-info-cache">${this.t("toc-control-info-cache")}</p>
          <button class="checklist-toc-run" data-checklist-action="toc-run"><i class="fas fa-book"></i> ${this.t("toc-check")}</button>
          <button class="checklist-toc-rerun" data-checklist-action="toc-rerun"><i class="fas fa-history"></i> ${this.t("toc-rerun")}</button>
        </div>
      </div>
    `;
    this.createView(html);
    this.resetStats();
    
    ui.on("filterStatements", () => {
      this.resetStats();
    });
  }

  addStat (name, nb = 1) {
    if (typeof name !== "string" || nb === 0) return this;
    const value = this.stats[name] || 0;
    const newValue = value + nb < 0 ? 0 : value + nb;
    this.stats[name] = newValue;

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

  resetStats () {
    this.stats = {};
    const ratings = this.getConfig("ratings", []);
    const $parent = this.find("#checklist-overview-stats");
    const statsHtml = ratings.map((rating) => {
      return `<li class="checklist-overview-stat-${rating.id}"></li>`;
    }).join("\n");
    $parent.html(statsHtml);
    return this;
  }
}

module.exports = Overview;
