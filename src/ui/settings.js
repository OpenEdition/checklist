const checklistVersion = __VERSION__;
const View = require("./view.js");

function getViewHtml (cache, filters, langs, currentLang, t, tk) {
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

  const langHtml = ((() => {
    if (langs.length < 2) return "";
    const options = langs.map((lang) => {
      const selectedAttr = currentLang === lang.code ? " selected" : "";
      return `<option value="${lang.code}"${selectedAttr}>${lang.name}</option>`;
    }).join("\n");
    return `
      <h3><i class="fas fa-language"></i> ${t("settings-language")}</h3>
      <select class="checklist-language-select">
        ${options}
      </select>
    `;
  })());

  const html = `
    <div id="checklist-settings" class="checklist-settings checklist-component checklist-childpane">
      <div class="checklist-main-menu">
        <div class="checklist-main-menu-title"><i class="fas fa-cog"></i> ${t("settings-title")}</div>
        <div class="checklist-main-menu-buttons">
          <button class="checklist-close-btn" data-checklist-action="close-component"><i class="fas fa-times-circle"></i></button>
        </div>
      </div>
      <div class="checklist-pane-contents">
        ${langHtml}

        <h3><i class="fas fa-filter"></i> ${t("settings-filters-title")}</h3>
        <p>${t("settings-filters-descripion")}</p>
        ${inputHtml}
        <button class="checklist-button" data-checklist-action="filter">${t("save")}</button>

        <h3><i class="fas fa-history"></i> ${t("settings-cache-title")}</h3>
        <p>${t("settings-cache-description")}</p>
        <button class="checklist-button" data-checklist-action="cache-clear">${t("settings-cache-clear")}</button>

        <p class="checklist-credits-infos">${t("credits-infos", { year: new Date().getFullYear(), version: checklistVersion})}</p>
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
    const langs = this.getConfig("langs", []);
    const html = getViewHtml(cache, filters, langs, this.ui.lang, this.ui.t, this.ui.tk);
    this.createView(html);
    this.initEventHandlers();
  }

  initEventHandlers () {
    const cache = this.ui.cache;
    this.find(".checklist-language-select").on("change", function () {
      const newLang = $(this).val();
      cache.set("lang", newLang);
      document.location.reload();
    });
    
    const $filterBtn = this.find("button[data-checklist-action='filter']");
    this.find(".checklist-filter").on("change", function () {
      $filterBtn.addClass("checklist-button-primary");
    });

    return this;
  }
}

module.exports = Settings;
