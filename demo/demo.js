$(function () {
  if (!window.checklist) {
    console.info("Checklist is not active");
    return;
  }

  const isPublication = $(document.body).hasClass("publication");

  // Prepare publi
  function getToc () {
    if (!isPublication) return;

    const toc = [{
      title: $(".publi-title").text(),
      href: window.location.pathname,
      type: "Publication",
      icon: "book"
    }];
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
          icon: "file-xml",
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
        name: "Première règle",
        description: "<p>Cette règle renvoie une notification sur toutes les pages.</p><p>Lorem ipsum dolor sit amet consectetur adipiscing elit eu nec, magnis purus porta donec eget class pretium sapien ultricies, aliquet sociis proin ante vivamus etiam montes fames. Convallis dis aptent platea massa taciti volutpat placerat inceptos erat ut, pharetra habitasse cras condimentum risus sapien sodales porta. Congue donec justo egestas porttitor integer quisque leo est, laoreet et urna risus blandit sociosqu aenean conubia lacinia.</p><a href='#'>Lien vers la documentation</a>",
        action: function () {
          this.notify();
          this.resolve(true);
        }
      },
      {
        name: "Seconde règle (ajax)",
        description: "<p>Cette règle recherche une information dans une source externe.",
        // TODO: href must be a function (variable)
        href: "./pages/1.html",
        action: function ($) {
          var flag = $("h1").length === 1;
          this.resolve(flag);
        }
      },
      {
        name: "Règle avec un délai",
        description: "Checklist supporte les tests asynchrones. Cette règle est exécutée avec un délai qui simule (par exemple) un requête asynchrone.",
        action: function ($) {
          var that = this;
          setTimeout(function () {
            that.resolve(true);
          }, 2000);
        }
      },
      {
        name: "Mauvaise condition",
        description: "Cette règle ne sera jamais appliquée.",
        condition: "rubrique",
        action: function ($) {
          this.resolve("This should never happen");
        }
      },
      {
        name: "Avertissement dans l'article 2",
        description: "Un avertissement qui ne ressort que dans l'article 2.",
        type: "warning",
        action: function ($, bodyClasses) {
          const flag = bodyClasses.includes("article-2");
          this.notify(flag);
          this.resolve();
        }
      },
      {
        name: "Erreur critique dans l'article 3",
        description: "Une erreur critique qui ne ressort que dans l'article 3.",
        type: "danger",
        action: function ($, bodyClasses) {
          const flag = bodyClasses.includes("article-3");
          this.resolve(flag);
        }
      },
      {
        name: "Règle qui appelle une source 404",
        description: "Un exemple de règle qui renvoie une exception",
        href: "bad-location",
        action: function () {
          this.resolve(true);
        }
      },
      {
        name: "Une règle qui injecte des marqueurs",
        description: "Cette règle injecte un marqueur à un paragraphe sur 5.",
        action: function ($) {
          const statement = this.notify();
          $("p").each(function (index) {
            if (index % 5 !== 0) return;
            statement.addMarker({
              name: "Marqueur",
              target: $(this),
              position: "after"
            });
          });

          this.resolve();
        }
      },
      {
        name: "Paper rule",
        description: "Une règle qui est associée à la catégorie 'papier'",
        tags: ["paper"],
        action: function () {
          this.resolve(true);
        }
      },
    ]
  })
  .then(function () {
    // Don't ditrectly run tests on publications
    if (!isPublication) {
      checklist.run();
    }
  });
});
