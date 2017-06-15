const utils = {
  // https://gist.github.com/getify/3667624
  escapeDoubleQuotes: function (str) {
    return str.replace(/\\([\s\S])|(")/g,"\\$1$2");
  },

  getDocIdFromPathname: function (pathname) {
    return pathname.replace(/\/$/, "");
  },

  getIdFromName: function (name) {
    return name.replace(/\W/gi, "-").toLowerCase();
  }
};

module.exports = utils;
