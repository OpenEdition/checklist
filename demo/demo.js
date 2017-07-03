$(function () {
  const isPublication = $(document.body).hasClass("publication");

  // Prepare toc
  function getToc () {
    if (!isPublication) return;

    const toc = [];
    $("#toc").find(".toc-entry").each(function () {
      const pathname = $(this).find("a").get(0).pathname;
      const entry = {
        title: $(this).find("h3").text(),
        subtitle: $(this).find(".subtitle").text(),
        author: $(this).find(".author").text(),
        href: pathname
      };
      toc.push(entry);
    });
    return toc;
  }

  checklist.init({
    parent: "body",
    buttonsCreator: function (docId) {
      return [
        {
          title: "Éditer",
          href: `${docId}/editer`
        },
        {
          title: "Test",
          onclick: "console.log('Hello world!')"
        }
      ];
    },
    context: function () {
      return {
        "article": true,
        "textes": true,
        "motsclesfr": $(".motsclesfr .entry").length
      };
    },
    toc: getToc(),
    rules: [
      {
        name: "First rule",
        description: "Hello world",
        action: function () {
          this.notify(true);
          this.resolve(true);
        }
      },
      {
        name: "Second rule (ajax)",
        description: "Foo bar",
        // TODO: href must be a function (variable)
        href: "./pages/1.html",
        action: function ($) {
          var flag = $("h1").length === 1;
          this.resolve(flag);
        }
      },
      {
        name: "Timeout rule",
        description: "Lorem ipsum",
        type: "warning",
        action: function ($) {
          var that = this;
          setTimeout(function () {
            that.resolve(true);
          }, 2000);
        }
      },
      {
        name: "False condition",
        description: "Obladi oblada!",
        condition: "rubrique",
        action: function ($) {
          this.resolve("This should never happen");
        }
      },
      {
        name: "Page 1 only",
        type: "danger",
        action: function ($) {
          const text = $("p").text();
          if (text === "This is the page 1.") {
            this.resolve(true);
          }
        }
      },
      {
        name: "Bad href",
        href: "bad",
        action: function () {
          this.resolve(true);
        }
      },
      {
        name: "Bad href (duplicate)",
        href: "bad",
        action: function () {
          this.resolve(true);
        }
      },
      {
        name: "With marker",
        action: function ($) {
          const statement = this.notify(true);
          statement.addMarker({
            name: "marker here",
            target: $("h1").get(0),
            position: "after"
          });
          statement.addMarker({
            name: "marker here",
            target: $("p"),
            position: "after"
          });
          statement.addMarker({
            name: "marker here",
            target: $("blockquote").get(0),
            position: "after"
          });
          this.resolve();
        }
      },
      {
        name: "Paper rule",
        tags: ["paper"],
        action: function () {
          this.resolve(true);
        }
      },
    ]
  })
  .then(function () {
    // TODO: show the panel automatically
    checklist.ui.show();
    checklist.run();

    // Run batch if publication
    if (isPublication) {
      // checklist.runBatchFromToc();
    }
  });
});
