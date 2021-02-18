const View = require("./view.js");

class Stackedbar extends View {
  constructor ({ ui, parent, overview }) {
    super("Overview", ui, parent);
		this.overview = overview;
		this.prevStats = {};
    this.createMarkup();
  }

	createMarkup() {
		const ratings = this.ui.ratings;
		const statsHtml = ratings.map((rating) => {
      return `<div class="checklist-stackedbar-stat-${rating.id}"><div class="checklist-stackedbar-stat-tooltip"></div></div>`;
    }).join("");
		const html = `<div class="checklist-stackedbar">${statsHtml}</div>`
    this.createView(html);
	}

	update (stats, states) {
    const prevStats = this.prevStats;
    const {length, pending, isBatchRunning} = states;

    // Hide "default" stat if script is running
    const isRunning = pending > 0 || isBatchRunning;
    const $default = this.find(".checklist-stackedbar-stat-default");
    $default.toggleClass("hidden", isRunning);

		const updateStat = (name, count, total, icon) => {
			const percent = count / total * 100;
			const $el = this.find(`.checklist-stackedbar-stat-${name}`);
			$el.width(`${percent}%`);

			if (this.overview) {
				this.overview.toggleLegend(name, count > 0);
			}

			const $tooltip = $el.find(".checklist-stackedbar-stat-tooltip");
			if (count === 0) {
				$tooltip.removeClass("visible").empty();
				return;
			}

			icon = icon || this.ui.getRating(name).icon;
			const contents = icon + "&nbsp;" + count;
			$tooltip.html(contents).addClass("visible");
		}

    Object.keys(stats).forEach((key) => {
      const current = stats[key];
      const prev = prevStats[key];
      if (current === prev) return; // Don't update if no change
      updateStat(key, current, length);
    });

		this.prevStats = stats;
    return this;
  }

	reset() {
		this.prevStats = {};
    this.find("div").removeAttr("style");
    this.find(".checklist-stackedbar-stat-tooltip").empty();
	}
}

module.exports = Stackedbar;