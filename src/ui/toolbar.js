const svg = require("./svg.json");
const View = require("./view.js");
const { testCondition } = require("../utils.js");

function getHtml (buttonsCreator, docId, context, tk) {
  const getButton = (infos) => {
    if (!testCondition(infos.condition, context)) {
      return;
    }
    const icon = (infos.icon && svg[infos.icon]);
    const translatedTitle = tk(infos.title);
    const text = icon || translatedTitle;
    const title = icon ? `title="${translatedTitle}"`: "";
    const attrs = [];
    for (let attr in infos.attributes) {
      const value = infos.attributes[attr];
      attrs.push(`${attr}="${value}"`);
    }
    return `
      <a class="checklist-toolbar-button" ${title} ${attrs.join(" ")}>
        ${text}
      </a>
    `;
  };

  const infos = buttonsCreator(docId);
  const buttonsHtml = infos.map(getButton).join("");
  const html = `
    <div class="checklist-toolbar">
      ${buttonsHtml}
    </div>
  `;
  return html;
}

class Toolbar extends View {
  constructor ({ ui, parent, docId, context }) {
    super("Toolbar", ui, parent);

    const buttonsCreator = this.getConfig("buttonsCreator");
    if (typeof buttonsCreator !== "function") return;

    context = context || this.getConfig("context");
    if (typeof context === "function") {
      const bodyClasses = $("body").get(0).className.split(/\s+/);
      context = context($, bodyClasses);
    }
    if (typeof context !== "object") return;

    const html = getHtml(buttonsCreator, docId, context, this.ui.tk);
    this.createView(html);
  }
}

module.exports = Toolbar;
