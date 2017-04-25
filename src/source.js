const EventEmitter = require("eventemitter2").EventEmitter2;

// Arg can be a href, an url or an instance of source
function getUrl (arg = "") {
  const hrefOrUrl = arg instanceof Source ? arg.url.href : arg;
  return new URL(hrefOrUrl, window.location.href);
}

class Source extends EventEmitter {
  constructor (href) {
    super();
    this.classname = "Source";
    this.url = getUrl(href);
    this.self = this.isSelf();
    // TODO: this must become a parameter
    this.selector = "#main";
  }

  complete () {
    this.emit("ready");
  }

  error (err) {
    this.emit("load-failed", err);
  }

  get$ () {
    return (selector, arg) => $(selector, arg || this.root);
  }

  is (arg) {
    const url = getUrl(arg);
    return this.url.href === url.href;
  }

  isSelf () {
    return this.url.href === window.location.href;
  }

  load () {
    // TODO: do we really need bodyClasses? (=> remember to check this at the end of dev)
    const getBodyClasses = (body = "body") => $(body).get(0).className.split(/\s+/);

    const loadLocal = () => {
      this.root = $(this.selector).get(0);
      this.bodyClasses = getBodyClasses();
      this.complete();
    };

    const loadRemote = () => {
      const bodyExists = (data) => typeof data === "string" && /\n.*(<body.*)\n/i.test(data);

      const setContainer = (data) => {
        const body = data.match(/\n.*(<body.*)\n/i)[1].replace("body", "div");
        const bodyClasses = getBodyClasses(body);
        const container = $(`<div>${data}</div>`).find(this.selector);
        const root = container.get(0);
        return {root, bodyClasses};
      };

      const ajaxSuccess = (data) => {
        if (!bodyExists(data)) {
          return this.error();
        }

        const {root, bodyClasses} = setContainer(data);
        if (!root) {
          return this.error();
        }

        this.root = root;
        this.bodyClasses = bodyClasses;
      };

      const ajaxOptions = {
        url: this.url.href,
        timeout: 20000, // TODO: add this timeout value to config
        success: ajaxSuccess,
        error: this.error.bind(this),
        complete: this.complete.bind(this)
      };
      $.ajax(ajaxOptions);
    };

    return this.self ? loadLocal() : loadRemote();
  }
}

module.exports = Source;
