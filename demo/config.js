checklist.setConfig({
  context: function () {
    return {
      "article": true,
      "textes": true,
      "motsclesfr": $(".motsclesfr .entry").length
    };
  },
  rules: [
    {
      name: "Rule Test",
      condition: "article && textes",
      action: function () {
        console.log("Processing Test...");
        this.notify({
          name: "First statement",
          description: "This is a first statement for testing purpose...",
          count: 2
        });
        this.notify();
        this.notify();
        this.resolve("Test result");
      }
    }
  ]
});
