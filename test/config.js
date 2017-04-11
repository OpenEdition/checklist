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
      no: false
    };
  },
  rules: [
    {
      name: "Context is true (function)",
      condition: (context) => context.yes && !context.no,
      action: () => setFlag("context-true-function")
    },
    {
      name: "Context is true (string)",
      condition: "yes && !no",
      action: () => setFlag("context-true-string")
    },
    {
      name: "Context is false",
      condition: "no",
      action: () => setFlag("context-false")
    }
  ]
});
