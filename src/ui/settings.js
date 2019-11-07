const View = require("./view.js");

function getViewHtml (cache, filters, t, tk) {
  const getInputHtml = (filters) => {
    const inputs = filters.map((filter) => {
      const isHidden = cache.getFilter(filter.id);
      const checkedAttr = isHidden ? "" : "checked";
      const elementId = `checklist-filter-${filter.id}`;
      return `
        <div class="checklist-filter-container">
          <input type="checkbox" id="${elementId}" class="checklist-filter" value="${filter.id}" ${checkedAttr}>
            <label for="${elementId}">${tk(filter.name)}</label>
          </input>
        </div>
      `;
    });
    return inputs.join("\n");
  };

  const inputHtml = getInputHtml(filters);

  const html = `
    <div id="checklist-settings" class="checklist-settings checklist-component checklist-childpane">
      <div class="checklist-main-menu">
        <div class="checklist-main-menu-title"><i class="fas fa-cog"></i> ${t("settings-title")}</div>
        <div class="checklist-main-menu-buttons">
          <button class="checklist-close-btn" data-checklist-action="close-component"><i class="fas fa-times-circle"></i></button>
        </div>
      </div>
      <div class="checklist-pane-contents">
        <h3><i class="fas fa-filter"></i> ${t("settings-filters-title")}</h3>
        <p>${t("settings-filters-descripion")}</p>
        ${inputHtml}
        <button class="checklist-button" data-checklist-action="filter">${t("save")}</button>

        <h3><i class="fas fa-history"></i> ${t("settings-cache-title")}</h3>
        <p>${t("settings-cache-description")}</p>
        <button class="checklist-button" data-checklist-action="cache-clear">${t("settings-cache-clear")}</button>

        <p class="checklist-credits-infos">${t("credits-infos", {year: new Date().getFullYear()})}</p>
      </div>
    </div>
  `;
  return html;
}

class Settings extends View {
  constructor ({ ui, parent }) {
    super("Settings", ui, parent);
    this.childpane = true;

    const cache = this.ui.cache;
    const filters = this.getConfig("filters");
    const html = getViewHtml(cache, filters, this.ui.t, this.ui.tk);
    this.createView(html);
    this.initEventHandlers();
  }

  initEventHandlers () {
    const $filterBtn = this.find("button[data-checklist-action='filter']");
    this.find(".checklist-filter").change(function () {
      $filterBtn.addClass("checklist-button-primary");
    });

    return this;
  }
}

module.exports = Settings;
