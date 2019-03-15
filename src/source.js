const Base = require("./base.js");

const winHref = window.location.href.replace(window.location.hash, "");

function getUrl (href = "") {
  return new URL(href, winHref);
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
    return this.url.href === winHref;
  }

  load () {
    const loadLocal = () => {
      this.root = document.body;
      this.bodyClasses = document.body.className.split(/\s+/);
      this.success().complete();
    };

    const loadRemote = () => {
      const bodyRegex = /<body([^<>]*)>/i;
      const bodyClone = "<div$1>";
      const bodyExists = (data) => typeof data === "string" && bodyRegex.test(data);

      const setContainer = (data) => {
        const bodyTag = data.match(bodyRegex)[0];
        const clone = bodyTag.replace(bodyRegex, bodyClone);
        const bodyClasses = $(clone).get(0).className.split(/\s+/);

        data = data.replace(bodyRegex, bodyClone);
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
      const timeout = this.getConfig("loaderTimeout", 10000);
      const delay = this.getConfig("loaderDelay", 0);
      const ajaxOptions = {
        url: href,
        timeout,
        success: ajaxSuccess,
        error: (jqXHR, textStatus, errorThrown) => {
          const msg = `Could not load URL ${href} (${textStatus}: ${errorThrown})`;
          this.error(Error(msg));
        },
        complete: this.complete.bind(this)
      };

      // Ability to emulate delay for development purpose
      window.setTimeout(() => {
        if (delay >= timeout) {
          this.error(`Could not load URL ${href} because of loaderDelay`);
          this.complete();
          return;
        }
        $.ajax(ajaxOptions);
      }, Math.min(delay, timeout));
    };

    return this.self ? loadLocal() : loadRemote();
  }
}

module.exports = Source;
