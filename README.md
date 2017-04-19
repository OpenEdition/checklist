# OpenEdition Checklist

## Installation and usage

Clone this repository and run `$ npm install`.

Then call jQuery and OpenEdition Checklist into the `<head>` and use it:

```html
  <!-- jQuery is required -->
  <script src="../node_modules/jquery/dist/jquery.min.js"></script>

  <!-- Include the core -->
  <script src="../dist/app.bundle.js"></script>

  <!-- Call your Checklist custom configuration -->  
  <script src="config.js"></script>

  <!-- Run Checklist when the page is ready -->  
  <script>
    $(function () {
	  checklist.start();
    });
  </script>
```

`checklist.start()` returns a instance of `Checker` that you can manipulate later:

```javascript
  $(function () {
    const checker = checklist.start(); // execute a first batch of checks
    const someNewRules = [...] // array containing new rules to execute
    checker.run(someNewRules); // run the new checks
  });
```

## Configuration overview

Use `checklist.setConfig(config)` to register your custom configuration (you can also directly pass the configuration as a parameter of `checklist.start()`).

Configuration is a JavaScript object which may contain the following keys:

* `context`: an JavaScript object which describes the context where to run the checker.
* `rules`: an array which contains the rules to test and run with the checker.
* `parent`: the CSS selector which describe the element where to append the UI (default is `#container`). Set this to `false` to disable UI (for testing purpose).
* `callback`: a function to execute once the checker is done. It takes two parameters: `checker` and `statements`.

## Context

`context` is an object which describes the context where to run the checker.

```javascript
  context: {
    article: true,
    resume: false,
    keywords: 5
  }
```

If a function is given then it will be evaluated during checker instantiation and the returned value will be used as `context`.

## Rules

`rules` is an array of rules which will be executed when `checklist.start()` or `checker.run()` are called.

Each rule is supposed to have a `condition` and an `action`. When the check is launched, the `action` is executed if the rule `condition` matches the `context`. Depending on the check results, `action` can trigger user notifications by creating statements which are sent to the checker once all the checks are done.

A rule may contains the following keys:

* `name`: default name for statements created by this rule action.
* `id`: default unique id for statements created by this rule action. If not specified then id is generated from the name.
* `description`: default description for statements created by this rule action.
* `condition`: a function or a string to define in which context to trigger action. See information below.
* `action`: a function which checks the content validity and may create statements to indicate potential errors. See information below.
* `count`: default count for statements created by this rule action. In most situations this should not be modified.

### `condition`

`condition` can be either a function which takes the context as an argument or a string which will be evaluated. Both should return a boolean which determines if `action` will be executed.

Assuming the context is:

```javascript
  context: {
    article: true,
    resume: false,
    keywords: 5
  }
```

Then the following conditions will evaluate to `true`:

```javascript
  condition: "article && !resume && keywords > 0"
```

```javascript
  condition: (context) => context.article && !context.resume && context.keywords > 0
```

### `action`

`action` is the function triggered when `condition` is `true`.

The following methods are available in this context:

* `this.notify(definition)`: create a statement from `definition`, which can be either an object, a string or `undefined`, in which case rule default values will be used. The `"statement"` event is emitted with the statement passed as a parameter.
* `this.resolve(definition)`: trigger the end of `action` and run the `"check-done"` event. If `definition` is defined then `this.notify(definition)` is called once before ending the function (set `definition` to `true` to use the rule default values in statement).
