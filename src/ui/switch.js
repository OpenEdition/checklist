// FIXME: charger switch depuis UI car 1) c'est pas logique autrement, 2) on a besoin de ui.t() dans switch

function startChecklist () {
  localStorage.setItem("checklist-on", true);
  location.reload();
}

function showSwitch () {
  // FIXME: window.t() n'existe pas, utiliser ui.t()
  const html = `
    <div id="checklist-start" class="checklist-start">
      <span>${t("checklist-activate")}</span>
      <div class="checklist-switch">
        <div class="checklist-slider"></div>
      </div>
    </div>
  `;
  const $el = $(html);
  $el.on("click", function () {
    const $switch = $(this).find(".checklist-switch");
    $switch.one("transitionend", startChecklist);
    $switch.addClass("checked");
  });
  $("body").append($el);
}

module.exports = showSwitch;
