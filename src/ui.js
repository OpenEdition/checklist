const Base = require("./base.js");
const Nanobar = require("nanobar");
const skeleton = require("./skeleton.js");
const { getDocIdFromPathname } = require("./utils.js");

// Load UI styles
require("./css/ui.css");

class UI extends Base {
  constructor ({ caller }) {
    super("UI", caller);
    this.widgets = {};
    this.triggerState("ready");
  }

  // FIXME: not consistent with other checklist components
  init (parent) {
    const injectSkeleton = (parent) => {
      this.$skeleton = skeleton.inject(parent);
    };

    const createProgressBar = () => {
      // TODO: create and use this.pane
      const pane = $("#checklist-ui").get(0);
      this.progressBar = new Nanobar({
        target: pane
      });
    };

    // FIXME: is it relevant to set this.parent here?
    this.parent = parent;
    injectSkeleton(parent);
    createProgressBar();
    this.triggerState("initialized");
  }

  copyToc (toc) {
    const getHtml = (toc) => {
      const lines = toc.map((entry) => {
        const href = entry.href;
        const docId = getDocIdFromPathname(href);

        const metadatas = [];
        for (let metadata in entry) {
          if (metadata === "href" || !entry[metadata]) continue;
          const line = `<p class="checklist-entry-${metadata}">${entry[metadata]}</p>`;
          metadatas.push(line);
        }

        const html = `
          <li class="checklist-toc-entry">
            ${metadatas.join("\n")}
            <ul class="checklist-statements" data-checklist-doc-id=${docId}></ul>
          </li>
        `;
        return html;
      });
      return lines.join("\n");
    };

    const html = getHtml(toc);
    const $toc = $("#checklist-toc");
    $toc.append(html);
  }

  injectStatement (statement) {
    const get$Target = (statement) => {
      const docId  = statement.docId;
      return $(`[data-checklist-doc-id='${docId}']`);
    };

    const injectSingleStatement = (statement) => {
      const countSpan = (statement.count && statement.count > 1) ? `<span class="checklist-count">${statement.count}</span>` : "";
      const li = `<li class="checklist-statement">${statement.name} ${countSpan}</li>`;
      const $target = get$Target(statement);
      $target.append(li);
      this.emit("injected.statement", statement);
    };

    if (Array.isArray(statement)) {
      statement.forEach(injectSingleStatement);
      this.emit("injected.statements", statement);
    } else if (statement != null) {
      injectSingleStatement(statement);
    }

    return this;
  }

  hide () {
    $(document.body).removeClass("checklist-visible");
    this.setState("visible", false);
    this.emit("hidden");
    return this;
  }

  show () {
    $(document.body).addClass("checklist-visible");
    this.triggerState("visible");
    return this;
  }

  setProgress (percentage) {
    this.progressBar.go(percentage);
  }
}

module.exports = UI;
