const cache = {
  get: function (id) {
    if (id == null) return;
    const key = `checklist-${id}`;
    return JSON.parse(localStorage.getItem(key));
  },

  set: function (id, value) {
    if (id == null) return;
    const key = `checklist-${id}`;
    localStorage.setItem(key, JSON.stringify(value));
  },

  clear: function () {
    const regex = /^checklist-/;
    Object.keys(localStorage).forEach((key) => {
      if (!regex.test(key)) return;
      localStorage.removeItem(key);
    });
  }
};

module.exports = cache;
