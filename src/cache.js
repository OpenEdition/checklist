const cache = {
  get: function (id, defaultValue) {
    if (id == null) return;
    const key = `checklist-${id}`;
    if (key != null) {
      return JSON.parse(localStorage.getItem(key));
    }
    return defaultValue;
  },

  set: function (id, value) {
    if (id == null) return;
    const key = `checklist-${id}`;
    localStorage.setItem(key, JSON.stringify(value));
    return this;
  },

  clear: function () {
    const regex = /^checklist-/;
    Object.keys(localStorage).forEach((key) => {
      if (!regex.test(key)) return;
      localStorage.removeItem(key);
    });
    return this;
  },

  setRecord: function (report) {
    const createRecord = (report) => {
      const exportStatement = (statement) => {
        // We dont need markers in cache because they are not used in toc view
        const {name, description, id, type, count} = statement;
        return {name, description, id, type, count};
      };

      const {docId, indicators, states, errMsgs} = report;
      const record = {docId, indicators, states, errMsgs};
      record.statements = report.checker.statements.map(exportStatement);
      return record;
    };

    const record = createRecord(report);
    cache.set(report.docId, record);
    return this;
  },

  getRecord: function (docId) {
    const record = cache.get(docId);
    return record;
  }
};

module.exports = cache;
