const Checklist = require("./checklist.js");

// Load LESS
require("./less/styles.less");

if (typeof jQuery === "undefined") {
  throw Error ("Checklist requires jQuery");
}

function startChecklist () {
  localStorage.setItem("checklist-on", true);
  location.reload();
}

function showSwitch () {
  const html = `
    <div id="checklist-start" class="checklist-start">
      <span>Start checklist</span>
      <div class="checklist-switch">
        <div class="checklist-slider"></div>
      </div>
    </div>
  `;
  const $el = $(html);
  $el.on("click", function () {
    const $switch = $(this).find(".checklist-switch");
    $switch.one("transitionend", startChecklist);
    $switch.addClass("checked");
  });
  $("body").append($el);
}

$(function () {
  // Show checklist button if off
  const on = localStorage.getItem("checklist-on");
  if (on === false || on === "false") {
    return showSwitch();
  }
  // Otherwise init checklist
  const userConfig = window.checklistUserConfig;
  window.checklist = new Checklist(userConfig);
});
