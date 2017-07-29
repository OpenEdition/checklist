const cache = require("./cache.js");
const View = require("./view.js");

function getViewHtml () {
  const getInputHtml = (filters) => {
    const inputs = filters.map((filter) => {
      const isHidden = cache.getFilter(filter.id);
      const checkedAttr = isHidden ? "" : "checked";
      const elementId = `checklist-filter-${filter.name}`;
      return `
        <div class="checklist-filter-container">
          <input type="checkbox" id="${elementId}" class="checklist-filter" value="${filter.id}" ${checkedAttr}>
            <label for="${elementId}">${filter.name}</label>
          </input>
        </div>
      `;
    });
    return inputs.join("\n");
  };

  const inputHtml = getInputHtml([
    {id: "type-info", name: "Informations"},
    {id: "type-warning", name: "Recommandations"},
    {id: "type-danger", name: "Alertes"},
    {id: "tag-paper", name: "Papier"}
  ]);

  const html = `
    <div id="checklist-settings" class="checklist-settings checklist-component checklist-childpane">
      <button class="checklist-close-btn" data-checklist-action="close-component">×</button>
      <h1>Préférences</h1>
      <h2>Filtres</h2>
      ${inputHtml}
    </div>
  `;
  return html;
}

class Settings extends View {
  constructor ({ ui, parent }) {
    super("Settings", ui, parent);
    this.childpane = true;

    const html = getViewHtml();
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

  clearFilters () {
    this.find("input.checklist-filter").each(function () {
      $(this).prop("checked", true);
    });
    return this;
  }
}

module.exports = Settings;
