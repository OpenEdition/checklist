const utils = {
  // https://gist.github.com/getify/3667624
  escapeDoubleQuotes: function (str) {
    return str.replace(/\\([\s\S])|(")/g,"\\$1$2");
  },

  getDocIdFromPathname: function (pathname) {
    return pathname.replace(/\/$/, "");
  }
};

module.exports = utils;
