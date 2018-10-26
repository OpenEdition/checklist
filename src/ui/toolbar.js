const svg = require("./svg.json");
const View = require("./view.js");

function getHtml (buttonsCreator, docId, tk) {
  const getButton = (infos) => {
    const icon = (infos.icon && svg[infos.icon]);
    const translatedTitle = tk(infos.title);
    const text = icon || translatedTitle;
    const title = icon ? `title="${translatedTitle}"`: "";
    const attrs = [];
    for (let attr in infos.attributes) {
      const value = infos.attributes[attr];
      attrs.push(`${attr}="${value}"`);
    }
    const button = `
      <a class="checklist-toolbar-button" ${title} ${attrs.join(" ")}>
        ${text}
      </a>
    `;
    return button;
  };

  const infos = buttonsCreator(docId);
  const buttonsHtml = infos.map(getButton).join("\n");
  const html = `
    <div class="checklist-toolbar">
      ${buttonsHtml}
    </div>
  `;
  return html;
}

class Toolbar extends View {
  constructor ({ ui, parent, docId }) {
    super("Toolbar", ui, parent);

    const buttonsCreator = this.getConfig("buttonsCreator");
    if (typeof buttonsCreator !== "function") return;
    const html = getHtml(buttonsCreator, docId, this.ui.tk);
    this.createView(html);
  }
}

module.exports = Toolbar;
