const View = require("./view.js");
const Stackedbar = require("./stackedbar.js");
const svg = require("./svg.json");

class Overview extends View {
  constructor ({ ui, parent }) {
    super("Overview", ui, parent);
    this.createMarkup();
  }

  createMarkup () {
    const html = `
      <div id="checklist-overview" class="checklist-overview">
        <section class="checklist-overview-section-info">
          <p class="checklist-overview-info">${this.t("toc-control-info")}</p>
        </section>
        <section class="checklist-overview-section-indicators">
          <h3>${this.t("overview-progress")}</h3>
          <div class="checklist-overview-stackedbar-container"></div>
        </section>
        <section class="checklist-overview-section-legend" data-display-condition="legend"></section>
        <section class="checklist-overview-section-running" data-display-condition="running">
            <p class="checklist-overview-running">${svg.spinner} ${this.t("toc-control-running")}</p>
        </section>
        <section class="checklist-overview-section-done" data-display-condition="done">
          <div class="checklist-overview-message">
            <i class="fas fa-thumbs-up"></i>
            <p class="checklist-overview-done">${this.t("toc-control-done")}</p>
          </div>
        </section>
        <section class="checklist-overview-section-cache" data-display-condition="cache">
          <div class="checklist-overview-message">
            <i class="fas fa-exclamation-circle"></i>
            <p class="checklist-overview-info">${this.t("toc-control-info-cache")}</p>
          </div>
          <button class="checklist-button checklist-button-primary checklist-toc-rerun" data-checklist-action="toc-rerun"><i class="fas fa-sync"></i> ${this.t("toc-rerun")}</button>
        </section>
        <section class="checklist-overview-section-run" data-display-condition="run-button">
          <button class="checklist-button checklist-button-primary checklist-toc-run" data-checklist-action="toc-run"><i class="far fa-play-circle"></i> ${this.t("toc-check")}</button>
        </section>
      </div>
    `;
    this.createView(html);

    // Stats (stackedbar)
    const $statsContainer = this.find(".checklist-overview-stackedbar-container");
    this.stackedbar = new Stackedbar({ui: this.ui, parent: $statsContainer, overview: this});

    // Legend
    const ratings = this.ui.ratings;
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
    this.stackedbar.reset();
    this.updateControls();
    return this;
  }

  update ({ states, ratings }) {
    this.updateControls(states);
    const stats = this.getStats(states, ratings);
    this.stackedbar.update(stats, states);
    return this;
  }

  updateControls (states = {}) {
    const running = states.pending > 0 || states.restarting > 0 || states.isBatchRunning;
    const conditions = [
      {
        name: "running",
        flag: running
      },
      {
        name: "legend",
        flag: !running
      },
      {
        name: "run-button",
        flag: states.done < states.length && !states.isBatchRunning
      },
      {
        name: "cache",
        flag: states.fromCache > 0 && states.done === states.length
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

  // Return a "stats" objet which contains ratings + "default" and "failed" special stats
  getStats (states, ratings) {
    return Object.assign({}, ratings, {
      default: states.blank + states.pending,
      failed: states.failed
    });
  }

  toggleLegend (name, flag) {
    const $legend = this.find(`.checklist-overview-legend-${name}`);
    $legend.toggleClass("visible", flag);
  }
}

module.exports = Overview;
