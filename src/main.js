const Checklist = require("./checklist.js");

// Load LESS
require("./less/styles.less");

if (typeof jQuery === "undefined") {
  throw Error ("Checklist requires jQuery");
}

$(function () {
  const userConfig = window.checklistUserConfig;
  window.checklist = new Checklist(userConfig);
});
