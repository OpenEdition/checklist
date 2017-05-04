const Checklist = require("./checklist.js");

if (typeof jQuery === "undefined") {
  throw Error ("Checklist requires jQuery");
}

const userConfig = window.checklistUserConfig;
window.checklist = new Checklist(userConfig);
