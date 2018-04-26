const utils = {
  getDocIdFromPathname: function (pathname) {
    return pathname.replace(/\/$/, "");
  }
};

module.exports = utils;
