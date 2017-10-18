function initActions (ui) {
  const actions = {
    "cache-clear": function () {
      ui.clearCache();
      window.alert("Le cache a été supprimé pour ce site.");
      location.reload();
    },

    "checklist-off": function () {
      localStorage.setItem("checklist-on", false);
      location.reload();
    },

    "close-component": function () {
      const parent = $(this).parents(".checklist-component").get(0);
      const view = parent.view;
      if (!view) return;
      view.close();
    },

    "filters-clear": function () {
      ui.clearFilters();
    },

    "help-show": function () {
      const parent = $(this).parent(".checklist-statement").get(0);
      const statement = parent.statement;
      const {name, description} = statement;
      if (!name || !description) return;
      ui.showInfo(`<h2>${name}</h2> <p>${description}</p>`);
    },

    "goto-next-marker": function () {
      const parent = $(this).parent(".checklist-statement").get(0);
      const statement = parent.statement;
      const markers = statement.markers;
      if (!markers || markers.length === 0) return;

      const winPos = $(window).scrollTop();
      const isBottomReached = winPos + $(window).height() > $(document).height() - 50;
      const tops = markers.map((marker) => {
        return $(marker.element).offset().top;
      });
      const nextTop = tops.find((top) => {
        return top > winPos + 10;
      });

      if (!isBottomReached && nextTop) {
        return $(window).scrollTop(nextTop);
      }
      $(window).scrollTop(tops[0]);
    },

    "settings-show": function () {
      ui.showChildpane("settings");
    },

    "report-rerun": function () {
      const el = $(this).parents(".checklist-report").get(0);
      const report = el.report;
      report.rerun();
    },

    "report-toggle-details": function () {
      const $container = $(this).parents(".checklist-report-container");
      if ($container.length === 0) return;
      const classname = "checklist-details-visible";
      const isVisible = $container.hasClass(classname);
      $container.toggleClass(classname, !isVisible);
    },

    "toc-rerun": function () {
      ui.refreshToc();
    },

    "toc-toggle": function () {
      ui.toggleToc();
      const $btn = $(".checklist-toc-control [data-checklist-action='toc-toggle']");
      const text = $btn.text();
      const newText = text === "Controler la publication" ? "Masquer" : "Controler la publication";
      $btn.text(newText);
    },

    "toggle-parent": function () {
      $(this).parent().toggleClass("open");
    }
  };

  for (let id in actions) {
    const action = actions[id];
    $(document.body).on("click", `[data-checklist-action='${id}']`, action);
  }
}

module.exports = initActions;
