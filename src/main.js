const Checklist = require("./checklist.js");

if (typeof jQuery === "undefined") {
  throw Error ("Checklist requires jQuery");
}

window.checklist = new Checklist();
