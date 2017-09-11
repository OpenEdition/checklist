const Checklist = require("./checklist.js");
const showSwitch = require("./ui/switch.js");

// Load LESS
require("./less/styles.less");

if (typeof jQuery === "undefined") {
  throw Error ("Checklist requires jQuery");
}

$(function () {
  // Show switch button if checklist is off
  const on = localStorage.getItem("checklist-on");
  if (on === false || on === "false") {
    return showSwitch();
  }
  // Otherwise init checklist
  const userConfig = window.checklistUserConfig;
  window.checklist = new Checklist(userConfig);
});
