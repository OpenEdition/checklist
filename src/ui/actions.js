function initActions (ui) {
  const actions = {
    "cache-clear": function () {
      ui.clearCache();
      window.alert("Le cache a été supprimé pour ce site.");
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

    "toc-toggle": function () {
      ui.toggleToc();
      const text = $(this).text();
      const newText = text === "Afficher" ? "Masquer" : "Afficher";
      $(this).text(newText);
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
