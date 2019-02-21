const Base = require("../base.js");
const View = require("./view.js");

function getHtml (buttonsCreator, docId, context, ui) {
  const {t, tk} = ui;
  const getEntries = (infos) => {
    if (!Base.testCondition(infos.condition, context)) {
      return;
    }
    const icon = infos.icon;
    const translatedTitle = tk(infos.title);
    const attrs = [];
    for (let attr in infos.attributes) {
      const value = infos.attributes[attr];
      attrs.push(`${attr}="${value}"`);
    }
    return `
      <li class="checklist-dropdown-entry">
        <a ${attrs.join(" ")}>${icon} ${translatedTitle}</a>
      </li>
    `;
  };

  const infos = buttonsCreator(docId, context);
  const buttonsHtml = infos.map(getEntries).join("");
  const html = `
    <nav class="checklist-dropdown">
      <button class="checklist-dropdown-button">${t("dropdown-menu-name")} <i class="fas fa-caret-down"></i></button>
      <ul class="checklist-dropdown-entries">
        ${buttonsHtml}
      </ul>
    </nav>
  `;
  return html;
}

class Dropdown extends View {
  constructor ({ ui, parent, docId, context }) {
    super("Dropdown", ui, parent);

    const buttonsCreator = this.getConfig("buttonsCreator");
    if (typeof buttonsCreator !== "function") return;

    context = context || this.getConfig("context");
    if (typeof context === "function") {
      const bodyClasses = $("body").get(0).className.split(/\s+/);
      context = context($, bodyClasses);
    }
    if (typeof context !== "object") return;

    const html = getHtml(buttonsCreator, docId, context, this.ui);
    this.createView(html);
  }
}

module.exports = Dropdown;
