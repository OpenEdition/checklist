const UI = require("./ui.js");
const Checker = require("./checker.js");

if (typeof jQuery === "undefined") {
  throw Error ("Checklist requires jQuery");
}

$(function () {
  // UI
  const ui = new UI({
    parent: "#container"
  });
  ui.show();

  // Checker
  const rules = window.checklist.rules;
  const checker = new Checker({ rules });
  checker.on("done", () => console.log("Checker is done"));
  checker.run();
});
