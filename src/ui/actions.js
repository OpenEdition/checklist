function tocToggleAll (flag) {
  const $containers = $(".checklist-toc-view .checklist-report-container");
  const classname = "checklist-details-visible";
  $containers.toggleClass(classname, flag);
}

function initActions (ui) {
  const actions = {
    "cache-clear": function () {
      ui.clearCache();
      window.alert(ui.t("cache-deleted"));
      location.reload();
    },

    "close-component": function () {
      const parent = $(this).parents(".checklist-component").get(0);
      const view = parent.view;
      if (!view) return;
      view.close();
    },

    "help-show": function () {
      const parent = $(this).parent(".checklist-statement").get(0);
      const statement = parent.statement;
      const {name, description} = statement;
      if (!name || !description) return;
      const tk = ui.tk;
      ui.showInfo(`<h2>${tk(name)}</h2> <p>${tk(description)}</p>`);
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

    "report-run": function () {
      let el = $(this).parents(".checklist-report-container").find(".checklist-report").get(0);
      const report = el.report;
      report.rerun();
    },

    "toggle-report-details": function () {
      const $container = $(this).parents(".checklist-report-container");
      if ($container.length === 0) return;
      const classname = "checklist-details-visible";
      const isVisible = $container.hasClass(classname);
      $container.toggleClass(classname, !isVisible);
    },

    "toc-fold": function () {
      tocToggleAll(false);
    },

    "toc-unfold": function () {
      tocToggleAll(true);
    },

    "toc-run": function () {
      ui.runToc();
    },

    "toc-rerun": function () {
      ui.runToc(true);
    },

    "toggle-parent": function () {
      $(this).parent().toggleClass("open");
    }
  };

  for (let id in actions) {
    const action = actions[id];
    $(document.body).on("click", `[data-checklist-action='${id}']`, function () {
      ui.emit("beforeAction", id);
      action.bind(this)();
      ui.emit("afterAction", id);
    });
  }
}

module.exports = initActions;
