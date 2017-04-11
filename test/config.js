// Function to store stuffs
function setFlag (name, value) {
  if (window.testFlags == null) {
    window.testFlags = {};
  }
  window.testFlags[name] = typeof value !== "undefined" ? value : true;
}

checklist.setConfig({
  context: function () {
    return {
      yes: true,
      no: false,
      maybe: function () { return true; }
    };
  },
  rules: [
    {
      name: "Context is true (function)",
      condition: (context) => context.yes && !context.no,
      action: () => setFlag("context-true-function")
    }
  ]
});
