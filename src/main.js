const Checklist = require("./checklist.js");

if (typeof jQuery === "undefined") {
  throw Error ("Checklist requires jQuery");
}

$(function () {
    window.checklist = new Checklist();
});
