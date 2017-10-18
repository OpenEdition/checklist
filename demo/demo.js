$(function () {
  if (!window.checklist) {
    console.info("Checklist is not active");
    return;
  }

  const isPublication = $(document.body).hasClass("publication");

  // Prepare publi
  function getToc () {
    if (!isPublication) return;

    const toc = [];
    $("#toc").find(".toc-entry").each(function () {
      const pathname = $(this).find("a").get(0).pathname;
      const entry = {
        title: (function (el) {
          const res = [];
          $(el).children("a").children().each(function () {
            res.push($(this).text().trim());
          });
          return res.join("<br>");
        })(this),
        href: pathname
      };
      toc.push(entry);
    });
    return toc;
  }

  function getPubli () {
    if ($("body").hasClass("publication")) {
      return {
        title: $(".publi-title").text(),
        toc: getToc()
      };
    }
    return false;
  }

  checklist.init({
    parent: "body",
    buttonsCreator: function (docId) {
      return [
        {
          title: "Éditer",
          icon: "pencil",
          attributes : {
            href: `${docId}/editer`
          }
        },
        {
          title: "Réimporter la source",
          icon: "upload",
          attributes: {
            onclick: "console.log('Button clicked!')"
          }
        },
        {
          title: "Télécharger la source au format .doc",
          icon: "file-word",
          attributes: {
            onclick: "console.log('Button clicked!')"
          }
        },
        {
          title: "Télécharger la source au format XML TEI",
          icon: "file",
          attributes: {
            onclick: "console.log('Button clicked!')"
          }
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
    publi: getPubli(),
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
        type: "danger",
        action: function () {
          this.resolve(true);
        }
      },
    ]
  })
  .then(function () {
    checklist.run();
  });
});
