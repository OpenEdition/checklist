const Base = require("./base.js");
const Nanobar = require("nanobar");
const templates = require("./templates.js");
const { getDocIdFromPathname } = require("./utils.js");

function getTemplate (templateName) {
  return templates[templateName];
}

class Widget extends Base {
  constructor ({ caller, parentSelector = "body", templateName }) {
    super("Widget", caller);
    Object.assign(this, {parentSelector, templateName});
    this.triggerState("ready");
  }

  attach () {
    let $parent = $(this.parentSelector);
    if ($parent.length !== 1) {
      throw Error("Widget: parent is required and must be unique");
    }
    const template = getTemplate(this.templateName);

    this.$element = $(template).appendTo($parent);
    this.element = this.$element.get(0);

    this.progressBar = new Nanobar({
      target: this.element
    });

    this.triggerState("attached");
    return this;
  }

  detach () {
    this.$element.remove();
    this.element = null;
    this.setState("attached", false);
    this.emit("detached");
  }

  setProgress (percentage) {
    this.progressBar.go(percentage);
  }

  setToc (toc) {
    const getHtml = (toc) => {
      const lines = toc.map((entry) => {
        const href = entry.location[0];
        const docId = getDocIdFromPathname(href);

        const metadatas = [];
        for (let metadata in entry) {
          if (metadata === "location" || !entry[metadata]) continue;
          const line = `<p class="checklist-entry-${metadata}">${entry[metadata]}</p>`;
          metadatas.push(line);
        }

        const html = `
          <li class="checklist-toc-entry" data-checklist-doc-id=${docId}>
            ${metadatas.join("\n")}
          </li>
        `;
        return html;
      });
      return lines.join("\n");
    };

    const html = getHtml(toc);
    const $toc = this.$element.find("#checklist-toc");
    $toc.append(html);
  }
}

module.exports = Widget;
