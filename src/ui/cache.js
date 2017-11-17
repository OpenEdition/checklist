const Base = require("../base.js");

class Cache extends Base {
  constructor ({ caller, namespace }) {
    super("Cache", caller);
    this.namespace = namespace;
  }

  get (id, defaultValue) {
    if (id == null) return;
    const namespace = this.namespace;
    const key = `checklist-${namespace}-${id}`;
    if (key != null) {
      return JSON.parse(localStorage.getItem(key));
    }
    return defaultValue;
  }

  set (id, value) {
    if (id == null) return;
    const namespace = this.namespace;
    const key = `checklist-${namespace}-${id}`;
    localStorage.setItem(key, JSON.stringify(value));
    return this;
  }

  clear (regex = new RegExp(`^checklist-${this.namespace}-`)) {
    Object.keys(localStorage).forEach((key) => {
      if (!regex.test(key)) return;
      localStorage.removeItem(key);
    });
    return this;
  }

  setRecord (report) {
    const createRecord = (report) => {
      const exportStatement = (statement) => {
        // We dont need markers in cache because they are not used in toc view
        const {name, description, id, type, count, tags} = statement;
        return {name, description, id, type, count, tags};
      };

      const {docId, indicators, states, rejections} = report;
      const record = {docId, indicators, states, rejections};
      record.statements = report.checker.statements.map(exportStatement);
      return record;
    };

    const record = createRecord(report);
    this.set(report.docId, record);
    return this;
  }

  getRecord (docId) {
    const record = this.get(docId);
    return record;
  }

  setFilter (id, value) {
    this.set(`filter-${id}`, value);
  }

  // Return true if filter exists, i.e. statements must be hidden
  getFilter (id) {
    return this.get(`filter-${id}`, false);
  }

  // Return true if any filter exists
  isFiltered (ids) {
    return ids.some((id) => this.getFilter(id));
  }

  clearFilters () {
    const namespace = this.namespace;
    const regex = new RegExp(`^checklist-${namespace}-filter-`);
    this.clear(regex);
  }
}

module.exports = Cache;
