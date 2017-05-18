$(function () {
  // checklist.onAny(console.log);
  // TODO: rename/alias "reset" => "init"
  // TODO: first checklist instanciation is useless. We need an init() method.
  checklist.reset({parent: "#container"})
  .then(function () {
    // TODO: show the panel automatically
    checklist.ui.show();
    // Prepare .run()
    checklist.config.set({
      context: function () {
        return {
          "article": true,
          "textes": true,
          "motsclesfr": $(".motsclesfr .entry").length
        };
      }
    });
    const rules = [
      {
        name: "First rule",
        action: function () {
          this.notify(true);
          this.resolve(true);
        }
      },
      {
        name: "Second rule (ajax)",
        // TODO: href must be a function (variable)
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
      },
      {
        name: "Page 1 only",
        action: function ($) {
          const text = $("p").text();
          if (text === "This is the page 1.") {
            this.resolve(true);
          }
        }
      }
    ];
    checklist.run(rules);
    // Prepare runBatch();
    // This is specific to the plateform
    const toc = [];
    $("#toc").find(".toc-entry").each(function () {
      const pathname = $(this).find("a").get(0).pathname;
      const entry = {
        title: $(this).find("h3").text(),
        subtitle: $(this).find(".subtitle").text(),
        author: $(this).find(".author").text(),
        location: pathname
      };
      toc.push(entry);
    });
    checklist.config.set("toc", toc);
    checklist.runBatchFromToc(rules);
  });
});
