const utils = {
  getDocIdFromPathname: function (pathname) {
    return pathname.replace(/\/$/, "");
  },

  getIdFromName: function (name) {
    return name.replace(/\W/gi, "-").toLowerCase();
  }
};

module.exports = utils;
