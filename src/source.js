const Base = require("./base.js");

// Arg can be a href, an url or an instance of source
function getUrl (arg = "") {
  const hrefOrUrl = arg instanceof Source ? arg.url.href : arg;
  return new URL(hrefOrUrl, window.location.href);
}

// location can be an array [href, selector]
function splitLocation (location) {
  let href = location;
  // TODO: add default selector in config
  let selector = "body";
  if (Array.isArray(location)) {
    href = location[0];
    selector = location[1];
  }
  return {href, selector};
}

class Source extends Base {
  constructor (location) {
    super("Source");

    const {href, selector} = splitLocation(location);
    Object.assign(this, {href, selector});

    this.url = getUrl(href);
    this.self = this.isSelf();
  }

  complete () {
    this.triggerState("ready");
  }

  done () {
    this.triggerState("done");
  }

  error (err) {
    this.triggerState("failed", err);
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
      if (!this.root) {
        return this.error(Error("root element not found"));
      }
      this.bodyClasses = getBodyClasses();
      this.complete();
    };

    const loadRemote = () => {
      const bodyExists = (data) => typeof data === "string" && /\n.*(<body.*)\n/i.test(data);

      const setContainer = (data) => {
        const body = data.match(/\n.*(<body.*)\n/i)[1].replace("body", "div");
        const bodyClasses = getBodyClasses(body);
        const $data = $(`<div>${data}</div>`);
        const container = this.selector ? $data.find(this.selector) : $data;
        const root = container.get(0);
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
