(function () {
  // Don't run tests if Checklist is not active
  const on = localStorage.getItem("checklist-on");
  if (on === false || on === "false") {
    // Handler
    const setActive = () => {
      localStorage.setItem("checklist-on", true);
      location.reload();
    };
    // Create element
    const $div = $("<div class='checklist-off'><p>Please activate Checklist and reload this page</p></div>");
    $("<button class='activate-checklist'>Activate</button>").click(setActive).appendTo($div);
    // Ready
    $(function () {
      $("#mocha").append($div);
    });
    return;
  }

  function importAll (r) {
    r.keys().forEach(r);
  }

  require("./vars.js");
  require("./utils.js");

  importAll(require.context('../src/', false, /tests\.js$/));
})();
