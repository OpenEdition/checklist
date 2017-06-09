const { getDocIdFromPathname } = require("./utils.js");

const currentDocId = getDocIdFromPathname(window.location.pathname);

const html = `
  <div id="checklist-ui" class="checklist-ui">
    <ul class="checklist-statements" data-checklist-doc-id=${currentDocId}>
    </ul>
    <div class="checklist-buttons">
      <button>Button</button>
    </div>
  </div>
  <div id="checklist-report" class="checklist-report">
    <ul id="checklist-toc" class="checklist-toc">
    <ul>
  </div>
`;

const skeleton = {
  inject: function (parent = "body") {
    const $element = $(html).appendTo(parent);
    return $element;
  }
};

module.exports = skeleton;
