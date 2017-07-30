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
