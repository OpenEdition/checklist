describe("Config", function () {

  before((done) => {
    checklist.init().then(() => done());
  });

  describe("User config", function () {

    it("Should load optional user config from window.checklistUserConfig", function () {
      const config = checklist.config;
      const userConfig = window.checklistUserConfig;
      Object.keys(userConfig).forEach((key) => {
        expect(config.get(key)).to.deep.equal(userConfig[key]);
      });
    });

    it("Should inject custom styles", function (done) {
      checklist.init({customStyles: `
        body {
          margin-bottom: 42px;
        }
      `})
      .then(() => {
        expectAsync(done, () => {
          const marginBottom = $("body").css("margin-bottom");
          expect(marginBottom).to.equal("42px");
        });
      });
    });

  });

  describe("Config manipulation", function () {

    beforeEach(() => {
      checklist.config.clear();
    });

    const myConfig = {
      parent: "#container",
      context: { hello: "world" },
      rules: [
        {
          name: "Hello world!",
          action: () => this.resolve()
        }
      ]
    };

    it ("Should set a key", function () {
      const config = checklist.config;
      config.set("lorem", "ipsum");
      expect(config.get("lorem")).to.deep.equal("ipsum");
    });

    it("Should extend config", function () {
      const config = checklist.config;
      config.extend(myConfig);
      Object.keys(myConfig).forEach((key) => {
        expect(config.get(key)).to.deep.equal(myConfig[key]);
      });
    });

    it("Should override a property of the config", function () {
      const config = checklist.config;
      const newContext = { foo: "bar" };
      config.extend(myConfig);
      config.set("context", newContext);
      Object.keys(myConfig).forEach((key) => {
        const targetValue = key === "context" ? newContext : myConfig[key];
        expect(config.get(key)).to.deep.equal(targetValue);
      });
    });

    it("Should clear config", function () {
      const config = checklist.config;
      config.clear();
      expect(config.getAll()).to.be.empty;
    });

  });

});
