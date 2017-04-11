const UI = require("./ui.js");
const Checker = require("./checker.js");

window.checklist = function ({rules, context, parent = "#container"}) {
  if (typeof jQuery === "undefined") {
    throw Error ("Checklist requires jQuery");
  }

  // UI
  const ui = new UI({parent});
  ui.show();

  // Checker
  const checker = new Checker({ rules, context });
  checker.on("done", () => {
    ui.inject(checker.statements);
  });
  checker.run();
};
