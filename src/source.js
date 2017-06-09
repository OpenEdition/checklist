const Base = require("./base.js");

function getUrl (href = "") {
  return new URL(href, window.location.href);
}

class Source extends Base {
  constructor ({ href, caller }) {
    super("Source", caller);

    this.href = href;
    this.url = getUrl(href);
    this.self = this.isSelf();
  }

  complete () {
    this.triggerState("ready");
    return this;
  }

  success () {
    this.triggerState("success");
    return this;
  }

  error (err) {
    this.error = err;
    this.triggerState("failed", err);
    return this;
  }

  get$ () {
    const fn = (selector, arg) => $(selector, arg || this.root);
    fn.root = this.root;
    return fn;
  }

  is (arg) {
    arg = arg instanceof Source ? arg.url.href : arg;
    const url = getUrl(arg);
    return this.url.href === url.href;
  }

  isSelf () {
    return this.url.href === window.location.href;
  }

  load () {
    const getBodyClasses = (body = "body") => $(body).get(0).className.split(/\s+/);

    const loadLocal = () => {
      this.root = document.body;
      this.bodyClasses = getBodyClasses();
      this.success().complete();
    };

    const loadRemote = () => {
      const bodyExists = (data) => typeof data === "string" && /\n.*(<body.*)\n/i.test(data);

      const setContainer = (data) => {
        const body = data.match(/\n.*(<body.*)\n/i)[1].replace("body", "div");
        const bodyClasses = getBodyClasses(body);
        const $data = $(`<div>${data}</div>`);
        const root = $data.get(0);
        return {root, bodyClasses};
      };

      const ajaxSuccess = (data) => {
        if (!bodyExists(data)) {
          return this.error(Error("body element not found"));
        }

        const {root, bodyClasses} = setContainer(data);
        if (!root) {
          return this.error(Error("root element not found"));
        }

        this.root = root;
        this.bodyClasses = bodyClasses;
        this.success();
      };

      const href = this.url.href;
      const ajaxOptions = {
        url: href,
        timeout: 20000, // TODO: add this timeout value to config
        success: ajaxSuccess,
        error: (jqXHR, textStatus, errorThrown) => {
          const msg = `Could not load URL ${href} (${textStatus}: ${errorThrown})`;
          this.error(Error(msg));
        },
        complete: this.complete.bind(this)
      };
      $.ajax(ajaxOptions);
    };

    return this.self ? loadLocal() : loadRemote();
  }
}

module.exports = Source;
