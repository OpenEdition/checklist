$(function () {
  if (!window.checklist) {
    console.info("Checklist is not active");
    return;
  }

  const isPublication = $(document.body).hasClass("publication");
  const isArticle = $(document.body).hasClass("article");
  const isMisc =$(document.body).hasClass("misc");

  const publi = {
    parent: "#toc-container",
    toc: [
      {
        "title": "Checklist Demo",
        "href": "http://localhost:3000/demo/",
        "type": "Publication",
        "icon": "fas fa-book",
        "context": {
          "publications": true
        }
      },
      {
        "title": "Article de test",
        "href": "http://localhost:3000/demo/article-1.html",
        "context": {
          "textes": true,
          "article": true
        }
      },
      {
        "title": "Une sous-partie",
        "section": [
          {
            "title": "Deuxième article",
            "href": "http://localhost:3000/demo/article-2.html",
            "context": {
              "textes": true,
              "article": true
            }
          },
          {
            "title": "Troisième article",
            "href": "http://localhost:3000/demo/article-3.html",
            "context": {
              "paper-test-only": true
            }
          },
          {
            "title": "Timeout article",
            "href": "http://www.google.com:81",
            "context": {
              "textes": true,
              "article": true
            }
          }
        ]
      }
    ]
  };

  // NOTE: To add an error in toc, append #error to the URL and refresh
  if (window.location.hash === "#error") {
    publi.toc.push({
      "title": "Une erreur 200",
      "href": "https://httpstat.us/200?sleep=5000",
      "context": {
        "textes": true,
        "article": true
      }
    });
  }

  if (isPublication) {
    $("#toc").append(`<p><code>publi</code> key passed to Checklist config:</p> <pre>${JSON.stringify(publi, null, 2)}</pre>`);
  }

  checklist.init({
    homeHref: "/demo",
    parent: "#pane-container",
    namespace: "demo",
    docId: "index",
    langs: [
      {code: "fr", name: "Français"},
      {code: "en", name: "English"},
    ],
    maxSourcesLoading: 5,
    loaderTimeout: 3000,
    loaderDelay: 1000,

    paneMessage: {
      fr: "Ceci est un test de message ajouté au début du paneau latéral.",
      en: "This is a test message added to the side pane."
    },

    translations: {
      fr: {
        "toc-check": "Controler tout (traduction alternative)"
      },
      en: {
        "toc-check": "Control this publication"
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
        id: "excellent",
        icon: "<i class='far fa-laugh-wink '></i>",
        text: {
          fr: "Ce document est très bien composé.",
          en: "This document is very well formated."
        },
        color: "#3c763d",
        bgcolor: "#dff0d8"
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
        id: "bad",
        icon: "<i class='far fa-meh'></i>",
        text: {
          fr: "Ce document contient des erreurs de composition.",
          en: "This document contains issues."
        },
        color: "#a94442",
        bgcolor: "#f2dede"
      }
    ],

    computeRating: function (statements, report) {
      let warning = false;
      for (let i=0; i < statements.length; i++) {
        const statement = statements[i];
        const type = statement.type;
        if (type === "danger") return "bad";
        if (type === "warning") warning = true;
      }
      return warning ? "good" : "excellent";
    },

    context: function ($, bodyClasses) {
      return {
        "article": bodyClasses.includes("article"),
        "textes":  bodyClasses.includes("article"),
        "publications": bodyClasses.includes("publication"),
        "motsclesfr": $(".motsclesfr .entry").length
      };
    },

    publi: isPublication ? publi : false,

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
        condition: "textes || publications",
        action: function () {
          this.notify();
          this.resolve(true);
        }
      },
      {
        id: "2nd-rule",
        name: "Seconde règle (ajax)",
        description: "<p>Cette règle recherche une information dans une source externe.",
        href: "./article-1.html",
        condition: "textes || publications",
        action: function ($, context, bodyClasses) {
          var flag = $(".titre-article-1").length === 1 && bodyClasses.indexOf("article-1") > -1;
          this.resolve(flag);
        }
      },
      {
        id: "delay-rule",
        name: "Règle avec un délai",
        description: "Checklist supporte les tests asynchrones. Cette règle est exécutée avec un délai qui simule (par exemple) un requête asynchrone.",
        condition: "textes || publications",
        action: function ($) {
          var that = this;
          setTimeout(function () {
            that.resolve(true);
          }, 2000);
        }
      },
      {
        id: "custom-notify",
        name: "Règle avec un message variable",
        description: "Cette règle utilise notify() pour redéclarer plusieurs attributs hérités du Check. Attention : cela augmente la taille du cache, c'est donc une fonctionnalité à utiliser avec parcimonie.",
        type: "warning",
        condition: "textes || publications",
        action: function ($) {
          this.resolve({
            name: {
              fr: "Une notification personnalisée",
              en: "Custom notification"
            },
            description: {
              fr: "<p>Ce Statement n'a pas la même description que la règle parente.</p>",
              en: "<p>This Statement has a description different than its parent rule's.</p>"
            },
            type: "danger"
          });
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
        condition: "textes || publications",
        action: function ($, context, bodyClasses) {
          const flag = bodyClasses.includes("article-2");
          this.notify(flag);
          this.notify(flag);
          this.resolve();
        }
      },
      {
        id: "error-article-2",
        name: "Erreur critique dans l'article 2",
        description: "Une erreur critique qui ne ressort que dans l'article 2.",
        type: "danger",
        condition: "textes || publications",
        action: function ($, context, bodyClasses) {
          const flag = bodyClasses.includes("article-2");
          this.resolve(flag);
        }
      },
      {
        id: "404",
        name: "Règle qui appelle une source 404",
        description: "Un exemple de règle qui renvoie une exception",
        href: "bad-location",
        condition: "textes || publications",
        action: function () {
          this.resolve(true);
        }
      },
      {
        id: "markers",
        name: "Une règle qui injecte des marqueurs",
        description: "Cette règle injecte un marqueur à un paragraphe sur 3.",
        condition: "textes || publications",
        action: function ($) {
          const statement = this.notify(true);
          $("p").each(function (index) {
            if (index % 3 !== 0) return;
            statement.addMarker({
              name: "Marqueur",
              target: $(this),
              position: "append"
            });
          });
          this.resolve();
        }
      },
      {
        id: "markers2",
        name: "Une autre règle qui injecte d'autres marqueurs",
        description: "Cette règle injecte un marqueur à un paragraphe sur 4.",
        condition: "textes || publications",
        type: "warning",
        action: function ($) {
          const statement = this.notify(true);
          $("p").each(function (index) {
            if (index % 4 !== 0) return;
            statement.addMarker({
              name: "Marqueur",
              target: $(this),
              position: "append"
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
        condition: "textes || publications || paper-test-only",
        action: function () {
          this.resolve(true);
        }
      },
      {
        id: "no-resolve",
        name: "Une règle sans resolve()",
        description: "Aucun resolve pour cette règle : il doit y avoir un timeout",
        type: "danger",
        condition: "textes || publications",
        action: function () {}
      },
      {
        id: "err",
        name: "Une règle qui lance une exception",
        type: "danger",
        condition: "textes || publications",
        action: function () {
          throw Error("Boum ! (test)");
        }
      },
      {
        id: "displayCount",
        name: "Une règle qui affiche le count même lorsqu'il est égal à 1.",
        condition: "textes || publications",
        displayCount: true,
        action: function () {
          this.resolve(true);
        }
      }
    ]
  })
  .then(function () {
    if (isArticle) {
      checklist.run().catch(console.error);
    }
    if (isMisc) {
      // Stackedbar demo
      var $target = $(".stackedbar-container");
      var docIds = ["http://localhost:3000/demo/article-1.html", "http://localhost:3000/demo/article-2.html", "http://localhost:3000/demo/article-3.html"];
      checklist.ui.createStackedbarFromCache($target, docIds);

      // Batch Check demo
      $("#run-batch").on("click", function() {
        var input = $("#batch-input").val();
        var options = {
          docs: JSON.parse(input),
        };
        checklist.runBatch(options)
        .then((checkers) => {
          console.log(checkers);
          checkers.forEach((checker) => {
            if (checker.error) return;
            var statements = checker.getStatements();
            console.log(statements);
          });
          alert("Please check your browser console.");
        });
      });
    }

  })
  .catch(console.error);
});
