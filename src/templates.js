const { getDocIdFromPathname } = require("./utils.js");

const currentDocId = getDocIdFromPathname(window.location.pathname);

const templates = {
  pane: `
    <div id="checklist-ui" class="checklist-ui">
      <ul class="checklist-statements" data-checklist-doc-id=${currentDocId}>
      </ul>
      <div class="checklist-buttons">
        <button>Button</button>
      </div>
    </div>
  `
};

module.exports = templates;
