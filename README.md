# OpenEdition Checklist

:information_source: Pour l'implémentation de ce script en tant que plugin pour Lodel, voir : https://github.com/OpenEdition/checklist-lodel

## Installation 

NodeJS, NPM et Git doivent être installés sur la machine.

1. Cloner ce dépôt
2. `cd checklist`
3. `npm install`

## Publication sur NPM

(pour une utilisation dans le plugin [checklist-lodel](https://github.com/OpenEdition/checklist-lodel) notamment)

1. Transpiler le code source : `npm run build`
2. Incrémenter la version dans `package.json`. REMARQUE : Checklist utilise la convention [semver](https://docs.npmjs.com/misc/semver)
3. Publier la nouvelle version sur NPM : `npm publish`

Pour mettre ensuite à jour `checklist` dans le plugin `checklist-lodel` voir : https://github.com/OpenEdition/checklist-lodel

## Développement

Checklist requiert jQuery et Font Awesome 5.

La commande `npm run dev` permet de transpiler et tester le code automatiquement dans le navigateur, et facilite donc le développement.

Les autres commandes suivantes sont disponibles :

* `npm run build`: transpiler le script.
* `npm run watch`: transpiler le script automatiquement quand le code est modifié.
* `npm run test`: lancer les tests unitaires et la démo dans le navigateur.
* `npm run dev`: transpiler et relancer les tests automatiquement quand le code est modifié.
* `npm run test-https` et `npm run dev-https` : variantes de `test` et `dev` qui utilisent https. Utile pour tester le script sur un site en https.

## Utilisation

### Initialisation et lancement

```javascript
// Intialisation de checklist
checklist.init({
  // Définir le parent où l'UI sera intégré.
  // Si cette variable est vide, l'UI ne sera pas créée.
  parent: "body",

  // Prefixe des clés du localStorage
  // Sur Revues.org et OpenEdition Books, utiliser le nom court
  namespace: "foobar",

  // Langues de l'interface
  // Lorsque plusieurs langues sont définies, un menu de sélection des langues est ajouté aux paramètres de Checklist.
  // La première langue est la langue par défaut.
  langs: [
    {code: "fr", name: "Français"},
    {code: "en", name: "English"},
  ],

  // Lien du logo Checklist (optionnel)
  homeHref: "/checklist",

  // Nombre maximum de requêtes Ajax lancées simultanément par le Loader
  maxSourcesLoading: 5,

  // Timeout des requêtes Ajax lancées par le Loader
  loaderTimeout: 10000,

  // Délai optionnel lors du chargement des sources (à utiliser pour le dev uniquement)
  loaderDelay: 0,

  // Timeout de l'exécution des tests
  checkTimeout: 3000,

  // Activer ou non l'affichage des markers dans le texte
  showMarkers: true,

  // Surcharger les traductions par défaut de l'interface. Voir src/ui/locales/
  translations: {
    fr: {
      "toc-check": "Contrôler le numéro"
    }
  },

  // Une fonction qui permet de créer les boutons de la barre d'outil.
  // Prend l'identifant du document en paramètre.
  buttonsCreator: function (docId, context) {
    return [
      {
        title: {
          fr: "Editer le document",
          en: "Edit document"
        },
        icon: "<i class='fas fa-edit'></i>",
        attributes : {
          href: `${docId}/edit`
        }
      },
      {
        title: {
          fr: "Télécharger la source",
          en: "Download source"
        },
        condition: "textes && article",
        icon: "<i class='far fa-file-word'></i>",
        attributes: {
          onclick: "doStuff()"
        }
      }
    ];
  },

  // Liste des types utilisés dans les règles et configuration de leur affichage dans l'interface
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

  // Type par défaut (utilisé quand le type d'une notification n'est pas spécifié)
  defaultType: "info",

  // Liste des filtres utilisés dans l'interface
  filters: [
    {
      id: "tag-paper",
      name: {
        fr: "Publication papier",
        en: "Print"
      }
    }
  ],

  // Liste des notes attribuées aux documents et configuration de leur affichage dans l'interface
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
    },
    // Les deux ratings suivants ("failed" et "default") seront générés automatiquement par le script s'ils ne sont pas mentionnés ici.
    // "failed" correspond aux checkers dont la source n'a pas pu être chargée
    // "default" est utilisé pour les checkers qui n'ont pas encore de rating
    {
      id: "failed",
      icon: "<i class='fas fa-exclamation-triangle'></i>",
      text: {
        fr: "Une erreur est survenue pendant la vérification de ce document.",
        en: "An error occured while checking this document."
      },
      color: "#ddd",
      bgcolor: "#333"
    },
    {
      id: "default",
      icon: "<i class='far fa-question-circle'></i>",
      text: {
        fr: "Ce document n'a pas encore été vérifié.",
        en: "This document was not checked yet."
      },
      color: "#999",
      bgcolor: "#eee"
    }
  ],

  // Fonction de calcul du rating affiché dans le report.
  // Prends les statements du report, et le report lui-même en paramètre et retourne un id de rating.
  computeRating: function (statements, report) {
    if (report.checksCount === 0) return "empty";
    let warning = false;
    for (let i=0; i < statements.length; i++) {
      const statement = statements[i];
      const type = statement.type;
      if (type === "danger") return "bad";
      if (type === "warning") warning = true;
    }
    return warning ? "good" : "excellent";
  },

  // Fonction de création du contexte.
  context: function ($) {
    return {
      "article": true,
      "textes": true,
      "publication": false,
      "motsclesfr": $(".motsclesfr .entry").length
    };
  },

  // Liste des règles.
  rules: [
    {
      id: "missing-title"
      name: {
        fr: "Absence de titre",
        en: "Missing title"
      },
      description: {
        fr: "<p>Le titre n'est pas présent sur la page.</p>",
        en: "<p>Title was not found on this page.</p>"
      },
      condition: "article || publication",
      type: "danger",
      action: function ($, context, bodyClasses) {
        var flag = $("h1").length === 0;
        this.resolve(flag);
      }
    },
    // etc.
  ],

  // Clé à utiliser dans le cas où la page courante contient une table des matières.
  // Dans ce cas, le raport de l'entité en cours ne sera pas automatiquement affiché dans le panel. À la place, l'option de relecture de la table des matières sera proposée à l'utilisateur.
  // Par exemple :
  publi: {
    parent: "body", // si ce sélecteur n'est pas spécifié, la toc sera injectée dans config.parent
    toc: [
      {
        title: $(".publi-title").text(),
        href: window.location.href, // indique qu'il s'agit de la page courante
        type: "Publication",
        icon: "fas fa-book",
        context: {"publications": true}
      }
      {
        title: "Premier article",
        href: "url/to/article1.html",
        context: {
          "textes": true,
          "article": true
        }
      },
      {
        "title": "Une sous-partie",
        "section": [
          {
            "title": "Deuxième article",
            "href": "ulr/to/article2.html",
            "context": {
              "textes": true,
              "article": true
            }
          }
        ]
      }
      // etc.
    ]
  }
})
.then(function () {
  // La méthode checklist.run() exécute Checklist et retourne une promesse qui transmet le Checker.
  // Cette méthode prend un objet optionnel {docId, href, rules, context, reloadSource} en paramètre :
  // * docId: id unique du document (utilisé en interne).
  // * href: URL du document qui sera chargé et vérifié par Checklist. En cas d'omission c'est la page courante qui est utilisée.
  // * rules: liste de règles à exécuter. En cas d'omission, les règles déclarées dans la configuration sont utilisées.
  // context: contexte à utiliser pour ce Checker. En cas d'omission le contexte déclaré dans la configuration est utilisé.
  // reloadSource: booléen qui lorsqu'il est vrai force le rechargement de la source. Par défaut (false) le Loader utilisera la source déjà chargée (si elle existe).
  checklist.run().then((checker) => {
    console.log("Exécution terminée !");
  })
  .catch(console.error);
});
```

### Définition des règles

```javascript
{
  // Nom de la règle.
  name: {
    fr: "Nom de la règle",
    en: "Rule name"
  },

  // Identifiant des statements créés par défaut par la règle.
  // S'il n'est pas précisé, il sera créé d'après l'attribut name. Il est toutefois fortement recommandé de donner un id à chaque règle.
  id: "id-de-la-regle",

  // Aide associée. Accepte le HTML.
  description: {
    fr: "<p>C'est une règle de démonstration.</p>",
    en: "<p>This is a sample rule.</p>"
  },

  // URL du document où appliquer cette règle. Si vide, on utilise le document du checker.
  // Peut être une string ou une fonction qui prend le check en paramètre et retourne une URL.
  href: "./pages/1.html",
  href: (check) => "./pages/" + check.docId,

  // Condition d'exécution de la règle.
  // Peut être une string à comparer avec le contexte du checker, ou une fonction qui prend le contexte en paramètre et renvoit un booléen.
  condition: "article && !texte",

  // Type par défaut des statements crés par la règle.
  // Valeur : "info" (defaut)|"warning"|"danger"
  type: "warning",

  // Étiquettes associées à cette règle.
  // Permet de créer des filtres spécifiques dans l'interface.
  tags: ["paper"],

  // Booléen qui indique si le compteur doit être affiché même quand il est égal à 1. Par défaut : false.
  displayCount: true,

  // Action de la règle.
  // Ne pas oublier de passer $ en paramètre pour que la règle fonctionne avec les sources externes chargées par le loader.
  // le deuxième paramètre correspond au contexte du checker.
  // Dans le cas de sources externes chargées via ajax, le tag body est remplacé par un div pour éviter une erreur du DOM. Pour cette raison le dernier paramètre d'action() correspond aux classes du body de la source.
  action: function ($, context, bodyClasses) {
    // Créer un statement en utilisant les valeurs par défaut de la règle
    this.notify(true);

    // Il est posible d'incrémenter le compteur en ajoutant d'autres statements identiques (= qui ont le même id)
    for (var i=0; i < 3; i++) {
      this.notify(true);
    }

    // ...ou en passant simplement un nombre en paramètre
    this.notify(3);

    // Si notify prend false pour argument alors il n'est pas pris en compte (c'est une écriture courte pour éviter les blocs conditionnels)
    const flag = 0 === 1;
    this.notify(flag);

    // Créer un statement avec des valeurs personnalisées.
    // Attention : l'utilisation de cette fonctionnalité augmente considérablement le poids du cache. Il est donc recommandé de privilégier une déclaration de ces valeurs via les attributs de la règle.
    this.notify({
      name: {
        fr: "Une notification différente",
        en: "A different notification"
      },
      description: {
        fr: "<p>Ce Statement n'a pas la même description que la règle parente.</p>",
        en: "<p>This Statement has a description different than its parent rule's.</p>"
      },
      type: "danger",
      tags: []
    });

    // Ajouter des markers.
    const statement = this.notify();
    const markerObj = {
      // Titre du marker.
      // Par défaut on utilise le nom du statement (qui est lui même peut-être hérité de la règle, voir ci-dessus).
      name: {
        fr: "Texte du marker",
        en: "Marker text"
      },

      // Type du marker.
      // Par défaut on utilise le type du statement (qui est lui même peut-être hérité de la règle, voir ci-dessus).
      type: "danger",

      // Element cible.
      target: $("h1").get(0),

      // Position: "prepend"|"append"|"after"|"before" (default = "prepend")
      position: "after",

      // Si true, ajoute l'attribut [data-checklist-highlight="true"] à l'élément cible.
      // Si highlight est un élément jQuery, c'est à cet élément qui sera ajouté l'attribut.
      highlight: false
    };
    statement.addMarker(markerObj);

    // Il est aussi possible de passer la description du marker en 2e parametre de notify()
    this.notify(true, markerObj);

    // Déclarer un exception au cours du test (si par exemple un élément de maquette n'existe pas)
    this.reject("Message d'erreur");

    // Déclarer la fin du test avec resolve().
    // C'est indipensable car tous les tests sont asynchrones.
    // notify() est exécuté avec les arguments passés en paramètre de resolve() avant la fin du test. Il est donc possible de créer une notification par défaut avec l'argument true et de passer un marker optionnel.
    this.resolve(true, markerObj);
  }
}
```

## Affichage de barres de progression

Checklist expose une API pour afficher une barre de progression de la vérification d'un groupe de documents (Stackedbar) à partir des données du cache :

```javascript
  var $target = $(".stackedbar-container");
  var docIds = ["url/to/article-1.html", "url/to/article-2.html", "url/to/article-3.html"];
  checklist.ui.createStackedbarFromCache($target, docIds);
```

## Fonctionnement interne

![](./how-it-works.png)

La méthode `checklist.init(siteConfig)` permet de définir la configuration propre au site et d'initialiser checklist sur la page.

La méthode `checklist.run(options)` permet de lancer la relecture d'un document :

* Une instance de Checker est créée.
* Celle-ci demande au Loader la source correspondant à l'URL du document. Le Loader retourne une Source (qu'il a éventuellement créée et chargée si nécessaire).
* Le checker calcule le contexte à partir de la source.
* Pour chaque règle (`rule`), une instance de Check est crée par le Checker.
* Le check vérifie que `rule.condition` correspond bien au contexte du checker. Le cas échéant, la règle est exécutée.
* Chaque règle a la possibilité de créer une ou plusieurs instances de Notification et de Marker.
* Si une UI est attachée à Checklist, alors les notifications et les markers sont progressivement transmises à l'UI qui les affiche.

La plupart des méthodes de ces modules retournent des promesses. La communication entre les différents modules est assurée par des événements.

## Événements

L'objet `checklist` émet les événements suivants :

* `checker.run`: émis lors de l'exécution d'un checker. Le checker est passé en argument du event handler.
* `checker.done`: émis à la fin de l'exécution d'un checker. Le checker est passé en argument du event handler.
* `check.dropped`: émis lorsqu'un check n'est pas exécuté parce que sa condition ne correspond pas au contexte. Le check est passé en argument du event handler.
* `check.run`: émis lors de l'exécution d'un check. Le check est passé en argument du event handler.
* `check.done`: émis à la fin de l'exécution d'un check. Le check est passé en argument du event handler.
* `check.success`: émis à la fin de l'exécution d'un check, uniquement en cas de succès. Le check est passé en argument du event handler.
* `check.rejected`: émis quand un check lève un exception. L'erreur est passée en premier argument et le check est passé en deuxième argument du event handler.
* `statement.new`: émis quand un statement est créé. Le statement est passé en argument du event handler.
* `ui.beforeAction` et `ui.afterAction`: émis respectivement avant et après l'exécution d'une action de l'UI. L'id de l'action est passé en argument du event handler.

Tous les objets internes de checklist exposent les attributs `classname` qui correspond au nom de la classe de l'objet, et `caller` qui est une référence au parent ayant créé l'objet en cours.

Pour connaître le checker responsable de la création d'un statement, il est donc possible de faire :

```javascript
  checklist.on("statement.new", function (statement) {
    var check = statement.caller;
    var checker = check.caller;
  });
```

## License

**OpenEdition Checklist**  
**Copyright (c) 2017 OpenEdition, Thomas Brouard**

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see http://www.gnu.org/licenses/.
