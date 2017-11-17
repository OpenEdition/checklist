const View = require("./view.js");

function getViewHtml (cache) {
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

  // TODO: this should be dynamically computed from available tags (so tags and their names should be defined in checklist.init())
  const inputHtml = getInputHtml([
    {id: "tag-paper", name: "Publication papier"}
  ]);

  const html = `
    <div id="checklist-settings" class="checklist-settings checklist-component checklist-childpane">
      <button class="checklist-close-btn" data-checklist-action="close-component">×</button>
      <h1>Préférences</h1>
      <h2>Filtres</h2>
      <p>Afficher uniquement les notifications associées aux catégories suivantes&nbsp:</p>
      ${inputHtml}
      <h2>Cache</h2>
      <p>Checklist utilise le cache de votre navigateur pour conserver des informations en mémoire comme les rapports de tests et la configuration.</p>
      <button data-checklist-action="cache-clear">Vider le cache</button>
      <h2>Désactiver</h2>
      <button data-checklist-action="checklist-off">Désactiver Checklist</button>
    </div>
  `;
  return html;
}

class Settings extends View {
  constructor ({ ui, parent }) {
    super("Settings", ui, parent);
    this.childpane = true;

    const cache = this.ui.cache;
    const html = getViewHtml(cache);
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
