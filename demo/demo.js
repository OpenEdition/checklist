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
      icon: "<i class='fas fa-book'></i>",
      context: {"publications": true}
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
        href: pathname,
        context: {
          "textes": true,
          "article": true
        }
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
    namespace: "demo",
    docId: "index",
    lang: "fr",
    maxSourcesLoading: 5,
    loaderTimeout: 10000,

    translations: {
      fr: {
        "toc-check": "Contrôler le numéro"
      }
    },

    buttonsCreator: function (docId, context) {
      return [
        {
          title: {
            fr: "Éditer",
            en: "Edit"
          },
          icon: "<i class='fas fa-edit'></i>",
          attributes : {
            href: `${docId}/editer`
          }
        },
        {
          title: {
            fr: "Réimporter la source",
            en: "Upload source"
          },
          condition: "textes",
          icon: "<i class='fas fa-file-upload'></i>",
          attributes: {
            onclick: "console.log('Button clicked!')"
          }
        },
        {
          title: {
            fr: "Télécharger la source au format .doc",
            en: "Download source in .doc format"
          },
          condition: "textes && article",
          icon: "<i class='far fa-file-word'></i>",
          attributes: {
            onclick: "console.log('Button clicked!')"
          }
        },
        {
          title: {
            fr: "Télécharger la source au format XML TEI",
            en: "Download source in XML format"
          },
          condition: "publications",
          icon: "<i class='far fa-file-code'></i>",
          attributes: {
            onclick: "console.log('Button clicked!')"
          }
        }
      ];
    },
    types: [
      {
        id: "danger",
        name: {
          fr: "Avertissements",
          en: "Danger"
        },
        color: "#ed5740"
      },
      {
        id: "warning",
        name: {
          fr: "Recommandations",
          en: "Warning"
        },
        color: "#f8d14c"
      },
      {
        id: "info",
        name: {
          fr: "Informations",
          en: "Information"
        },
        color: "#3d9cdf"
      }
    ],
    filters: [
      {
        id: "tag-paper",
        name: {
          fr: "Publication papier",
          en: "Print"
        }
      }
    ],
    ratings: [
      {
        id: "bad",
        icon: "<i class='far fa-meh'></i>",
        text: {
          fr: "Ce document contient des erreurs de composition.",
          en: "This document contains issues."
        },
        color: "#a94442",
        bgcolor: "#f2dede"
      },
      {
        id: "good",
        icon: "<i class='far fa-smile'></i>",
        text: {
          fr: "Ce document est correctement composé.",
          en: "This document is well formated."
        },
        color: "#31708f",
        bgcolor: "#d9edf7"
      },
      {
        id: "excellent",
        icon: "<i class='far fa-laugh-wink '></i>",
        text: {
          fr: "Ce document est très bien composé.",
          en: "This document is well formated"
        },
        color: "#3c763d",
        bgcolor: "#dff0d8"
      }
    ],

    computeRating: function (statements) {
      let warning = false;
      for (let i=0; i < statements.length; i++) {
        const statement = statements[i];
        const type = statement.type;
        if (type === "danger") return "bad";
        if (type === "warning") warning = true;
      }
      return warning ? "good" : "excellent";
    },

    context: function () {
      return {
        "article": !isPublication,
        "textes":  !isPublication,
        "publications": isPublication,
        "motsclesfr": $(".motsclesfr .entry").length
      };
    },

    publi: getPubli(),

    rules: [
      {
        id: "first-rule",
        name: {
          fr: "Première règle",
          en: "First rule"
        },
        description: {
          fr: "<p>Cette règle renvoie une notification sur toutes les pages.</p><p>Lorem ipsum dolor sit amet consectetur adipiscing elit eu nec, magnis purus porta donec eget class pretium sapien ultricies, aliquet sociis proin ante vivamus etiam montes fames. Convallis dis aptent platea massa taciti volutpat placerat inceptos erat ut, pharetra habitasse cras condimentum risus sapien sodales porta. Congue donec justo egestas porttitor integer quisque leo est, laoreet et urna risus blandit sociosqu aenean conubia lacinia.</p><a href='#'>Lien vers la documentation</a>",
          en: "<p>Description in English...</p><a href='#'>Link to documentation</a>"
        },
        action: function () {
          this.notify();
          this.resolve(true);
        }
      },
      {
        id: "2nd-rule",
        name: "Seconde règle (ajax)",
        description: "<p>Cette règle recherche une information dans une source externe.",
        // TODO: href must be a function (variable)
        href: "./pages/article-1.html",
        action: function ($) {
          var flag = $("h1").length === 1;
          this.resolve(flag);
        }
      },
      {
        id: "delay-rule",
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
        id: "bad-condition",
        name: "Mauvaise condition",
        description: "Cette règle ne sera jamais appliquée.",
        condition: "rubrique",
        action: function ($) {
          this.resolve("This should never happen");
        }
      },
      {
        id: "2-warnings-article-2",
        name: "Deux avertissements dans l'article 2",
        description: "Un avertissement qui ne ressort que dans l'article 2.",
        type: "warning",
        action: function ($, bodyClasses) {
          const flag = bodyClasses.includes("article-2");
          this.notify(flag);
          this.notify(flag);
          this.resolve();
        }
      },
      {
        id: "error-article-3",
        name: "Erreur critique dans l'article 3",
        description: "Une erreur critique qui ne ressort que dans l'article 3.",
        type: "danger",
        action: function ($, bodyClasses) {
          const flag = bodyClasses.includes("article-3");
          this.resolve(flag);
        }
      },
      {
        id: "404",
        name: "Règle qui appelle une source 404",
        description: "Un exemple de règle qui renvoie une exception",
        href: "bad-location",
        action: function () {
          this.resolve(true);
        }
      },
      {
        id: "markers",
        name: "Une règle qui injecte des marqueurs",
        description: "Cette règle injecte un marqueur à un paragraphe sur 3.",
        action: function ($) {
          const statement = this.notify(true);
          $("p").each(function (index) {
            if (index % 3 !== 0) return;
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
        id: "paper-rule",
        name: "Paper rule",
        description: "Une règle qui est associée à la catégorie 'papier'",
        type: "warning",
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
