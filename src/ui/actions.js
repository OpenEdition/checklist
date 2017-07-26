function initActions (ui) {
  const actions = {
    "filters-clear": function () {
      ui.clearFilters();
    },

    "help-hide": function () {
      ui.hideInfo();
    },

    "help-show": function () {
      const parent = $(this).parent(".checklist-statement").get(0);
      const statement = parent.statement;
      const description = statement.description;
      if (!description) return;
      ui.showInfo(description);
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
