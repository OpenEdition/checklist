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
      <button class="checklist-close-btn" data-checklist-action="close-component">×</button>
      <h1>${t("settings-title")}</h1>
      <h2>${t("settings-filters-title")}</h2>
      <p>${t("settings-filters-descripion")}</p>
      ${inputHtml}
      <h2>${t("settings-cache-title")}</h2>
      <p>${t("settings-cache-description")}</p>
      <button data-checklist-action="cache-clear">${t("settings-cache-clear")}</button>
      <h2>${t("settings-disable-title")}</h2>
      <button data-checklist-action="checklist-off">${t("settings-disable-button")}</button>
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
    const inputHandler = (filterId, hidden) => {
      this.ui.filterStatements(filterId, hidden);
    };

    this.find(".checklist-filter").change(function () {
      const filterId = $(this).prop("value");
      const hidden = !$(this).prop("checked");
      inputHandler(filterId, hidden);
    });

    return this;
  }
}

module.exports = Settings;
