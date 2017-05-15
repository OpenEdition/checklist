$(function () {
  // checklist.onAny(console.log);
  // TODO: rename/alias "reset" => "init"
  // TODO: first checklist instanciation is useless. We need an init() method.
  checklist.reset({parent: "#container"})
  .then(function () {
    // TODO: show the panel automatically
    checklist.ui.show();
    checklist.config.set({
      context: function () {
        return {
          "article": true,
          "textes": true,
          "motsclesfr": $(".motsclesfr .entry").length
        };
      }
    });
    checklist.run([
      {
        name: "First rule",
        action: function () {
          this.notify(true);
          this.resolve(true);
        }
      },
      {
        name: "Second rule (ajax)",
        href: ["./pages/1.html", "#main"],
        action: function ($) {
          var flag = $("h1").length === 1;
          this.resolve(flag);
        }
      },
      {
        name: "Timeout rule",
        action: function ($) {
          var that = this;
          setTimeout(function () {
            that.resolve(true);
          }, 2000);
        }
      },
      {
        name: "False condition",
        condition: "rubrique",
        action: function ($) {
          this.resolve("This should never happen");
        }
      }
    ]);
  });
});
