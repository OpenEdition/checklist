const View = require("./view.js");

class Overview extends View {
  constructor ({ ui, parent }) {
    super("Overview", ui, parent);

    this.stats = {};
    this.length = 0;
    this.statsCount = 0;
    this.errorsCount = 0;

    const html = `
      <div id="checklist-overview" class="checklist-overview">
        <div class="checklist-overview-stats"></div>
        <div class="checklist-overview-errors"></div>
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
    this.createView(html).init();

    ui.on("filterStatements", () => this.reset());
  }

  init () {
    const ratings = this.getConfig("ratings", []);
    const $parent = this.find(".checklist-overview-stats");
    const statsHtml = ratings.map((rating) => {
      return `<li class="checklist-overview-stat-${rating.id}"></li>`;
    }).join("\n");
    $parent.html(statsHtml);
    return this;
  }

  reset () {
    this.find(".checklist-overview-stats li").empty();
    return this;
  }

  addStat (name, nb = 1) {
    if (typeof name !== "string" || nb === 0) return this;

    const value = this.stats[name] || 0;
    const newValue = value + nb < 0 ? 0 : value + nb;
    this.stats[name] = newValue;

    this.increment("statsCount", nb);
    this.updateProgress();

    const rating = this.ui.getRating(name);

    if (rating == null) {
      // TODO: gerer les erreur comme ça partout
      const err = new Error(`Missing rating declaration for '${name}'`);
      this.emit("error", err);
      return this;
    };

    const icon = rating.icon;
    let $el = this.find(`.checklist-overview-stat-${name}`);
    $el.html(`${icon} ${newValue}`);
    $el.toggleClass("visible", newValue > 0);
    return this;
  }

  addError (flag) {
    const nb = flag ? 1 : -1;
    this.increment("errorsCount", nb);
    this.increment("statsCount", nb);
    this.updateProgress();
    // TODO: display some notification in overview
    this.find(".checklist-overview-errors").text("Errors : " + this.errorsCount);
    return this;
  }

  increment (attrName, nb) {
    const attr = this[attrName];
    if (typeof attr === "undefined") {
      this.emit("error", `Overview attribute ${attrName} is undefined.`);
      return;
    }
    const sum = attr + nb;
    if (sum > this.length || sum < 0) return;
    this[attrName] = sum;
  }

  setLength (length) {
    this.length = length;
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
