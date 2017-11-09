# OpenEdition Checklist

## Installation

1. Cloner le dépôt.
2. Installer les dépendances `npm install`.
3. Compiler le script : `npm run build`

Checklist requiert jQuery.

```html
  <!-- jQuery  -->
  <script src="../node_modules/jquery/dist/jquery.min.js"></script>

  <!-- Noyau de checklist -->
  <script src="../dist/checklist.js"></script>

  <!-- Configuration de checklist (voir plus bas) -->  
  <script src="path/to/checklist-config.js"></script>
```

## Utilisation

### Initialisation et lancement

```javascript
// Intialisation de checklist
checklist.init({
  // Définir le parent où l'UI sera intégré.
  // Si cette variable est vide, l'UI ne sera pas créée.
  parent: "body",

  // Une fonction qui permet de créer les boutons de la barre d'outil.
  // Prend l'identifant du document en paramètre.
  buttonsCreator: function (docId) {
    return [
      {
        title: "Edit document",
        icon: "pencil",
        attributes : {
          href: `${docId}/edit`
        }
      },
      {
        title: "Download source",
        icon: "file-word",
        attributes: {
          onclick: "doStuff()"
        }
      }
    ];
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
      name: "Absence de titre",
      description: "<p>Le titre n'est pas présent sur la page.</p>",
      condition: "article || publication",
      type: "danger",
      action: function ($, bodyClasses) {
        var flag = $("h1").length === 0;
        this.resolve(flag);
      }
    },
    // etc.
  ],

  // Clé à utiliser dans le cas où la page courante contient une table des matières.
  // Dans ce cas, le raport de l'entité en cours ne sera pas automatiquement affiché dans le panel. À la place, l'option de relecture de la table des matières sera proposée à l'utilisateur.
  publi: {
    title: "Titre de la publication",
    toc: [
      {
        title: "Premier article",
        href: "url/to/article.html"
      },
      // etc.
    ]
  }
})
.then(function () {
  checklist.run();
});
```

### Définition des règles

```javascript
{
  // Nom de la règle.
  // C'est aussi cette clé qui est utilisé par défaut pour les titres des statements créés par cette règle.
  name: "Nom de la règle",

  // Identifiant des statements créés par défaut par la règle.
  // S'il n'est pas précisé, il sera créé d'après l'attribut name.
  id: "id-de-la-regle",

  // Aide associée. Accepte le HTML.
  description: "<p>C'est une règles de démonstration.</p>",

  // URL du document où appliquer cette règle. Si vide, on utilise le document du checker.
  href: "./pages/1.html",

  // Condition d'exécution de la règle.
  // Peut être une string à comparer avec le contexte du checker, ou une fonction qui prend le contexte en paramètre et renvoit un booléen.
  condition: "article && !texte",

  // Type par défaut des statements crés par la règle.
  // Valeur : "info" (defaut)|"warning"|"danger"
  type: "warning",

  // Étiquettes associées à cette règle.
  // Permet de créer des filtres spécifiques dans l'interface.
  tags: ["paper"],

  // Action de la règle.
  // Ne pas oublier de passer $ en paramètre pour que la règle fonctionne avec les sources externes chargées par le loader.
  // Dans le cas de sources externes chargées via ajax, le tag body est remplacé par un div pour éviter une erreur du DOM. Pour cette raison le deuxième paramètre d'action() correspond aux classes du body de la source.
  action: function ($, bodyClasses) {
    // Créer un statement en utilisant les valeurs par défaut de la règle
    this.notify();

    // Il est posible d'incrémenter le compteur en ajoutant d'autres statements identiques (= qui ont le même id).
    for (var i=0; i < 3; i++) {
      this.notify();
    }

    // Si notify prend false pour argument alors il n'est pas pris en compte (c'est une écriture courte pour éviter les blocs conditionnels)
    const flag = 0 === 1;
    this.notify(flag);

    // Créer un statement avec des valeurs personnalisées.
    this.notify({
      name: "Une notification différente",
      id: "un-id-different",
      description: "<p>Ce Statement n'a pas la même description que la règle parente.</p>",
      type: "danger",
      tags: []
    });

    // Ajouter des markers.
    var statement = this.notify();
    statement.addMarker({
      // Titre du marker.
      // Par défaut on utilise le nom du statement (qui est lui même peut-être hérité de la règle, voir ci-dessus).
      name: "Texte du marker",

      // Type du marker.
      // Par défaut on utilise le type du statement (qui est lui même peut-être hérité de la règle, voir ci-dessus).
      type: "danger",

      // Element cible.
      target: $("h1").get(0),

      // Position: "after"|"before"
      position: "after"
    });

    // Déclarer un exception au cours du test (si par exemple un élément de maquette n'existe pas)
    this.reject("Message d'erreur");

    // Déclarer la fin du test avec resolve().
    // C'est indipensable car tous les tests sont asynchrones.
    // Si un argument est donné, this.notify() est exécuté avec cet argument avant la fin du test. Il est donc possible de créer une notification par défaut avec l'argument true.
    this.resolve(true);
  }
}
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
* `check.run`: émis lors de l'exécution d'un check. Le check est passé en argument du event handler.
* `check.done`: émis à la fin de l'exécution d'un check. Le check est passé en argument du event handler.
* `check.success`: émis à la fin de l'exécution d'un check, uniquement en cas de succès. Le check est passé en argument du event handler.
* `check.rejected`: émis quand un check lève un exception. L'erreur est passée en premier argument et le check est passé en deuxième argument du event handler.
* `statement.new`: émis quand un statement est créé. Le statement est passé en argument du event handler.

Tous les objets internes de checklist exposent les attributs `classname` qui correspond au nom de la classe de l'objet, et `caller` qui est une référence au parent ayant créé l'objet en cours.

Pour connaître le checker responsable de la création d'un statement, il est donc possible de faire :

```javascript
  checklist.on("statement.new", function (statement) {
    var check = statement.caller;
    var checker = check.caller;
  });
```

## Développement

Les scripts npm suivants sont disponibles :

* `build`: compiler le script.
* `watch`: compiler le script automatiquement quand le code est modifié.
* `test`: lancer les tests unitaires et la démo dans le navigateur.
* `dev`: compiler et relancer les tests automatiquement quand le code est modifié.
* `test-https` et `dev-https` : variantes de `test` et `dev` qui utilisent https pour servir le script. Utile pour tester le script sur un site en https où le navigateur bloquera les contenus servis en http.

## License

**OpenEdition Checklist**
**Copyright (c) 2017 OpenEdition, Thomas Brouard**

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see http://www.gnu.org/licenses/.
