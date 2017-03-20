const UI = require("./ui.js");

if (typeof jQuery === "undefined") {
  throw Error ("Checklist requires jQuery");
}

$(function () {
  const ui = new UI({
    parent: "#container"
  });
});
