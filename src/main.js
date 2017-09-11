const Checklist = require("./checklist.js");

if (typeof jQuery === "undefined") {
  throw Error ("Checklist requires jQuery");
}

function startChecklist () {
  localStorage.setItem("checklist-on", true);
  location.reload();
}

function showSwitch () {
  const html = `<div id="#checklist-switch" class="checklist-switch">Start checklist</div>`;
  const $el = $(html).on("click", startChecklist);
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
