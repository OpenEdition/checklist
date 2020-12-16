const Base = require("../base.js");
const Statement = require("../statement.js");

class Cache extends Base {
  constructor ({ caller }) {
    super("Cache", caller);
    this.namespace = this.getConfig("namespace");
  }

  get (id, defaultValue) {
    if (id == null) return defaultValue;
    const namespace = this.namespace;
    const key = `checklist-${namespace}-${id}`;
    const value = JSON.parse(localStorage.getItem(key));
    return value === null ? defaultValue : value;
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

  setFilter (id, value) {
    this.set(`filter-${id}`, value);
  }

  // Return true if filter exists, i.e. statements must be hidden
  getFilter (id) {
    return this.get(`filter-${id}`, true);
  }

  // Return true if any filter exists
  isFiltered (ids) {
    return ids.some((id) => this.getFilter(id));
  }

  setRecord (checker) {
    const docId = checker.docId;

    const statements = checker.getStatements().map(({id, count}) => { 
      // TODO: add overrides
      return { id, count };
    });

    const rejections = checker.checks.reduce((res, check) => {
      if (check.hasState("rejected")) {
        const { id, errMsg } = check;
        res.push({ id, errMsg });
      }
      return res;
    }, []);
    
    const record = { statements, rejections };
    this.set(docId, record);
  }

  getRecord (docId) {
    const record = this.get(docId);
    if (!record) return;
    
    const cache = this;
    const rules = this.getConfig("rules");
    const getRule = (id) => rules.find(r => r.id === id);

    const statements = record.statements.map(({ id, count }) => {
      const rule = getRule(id);
      if (!rule) return;
      const options = Object.assign({}, rule, { count, caller: cache });
      return new Statement(options);
    });

    const rejections = record.rejections.map(({ id, errMsg }) => {
      const rule = getRule(id);
      if (!rule) return;
      return {
        errMsg,
        ruleName: rule.name
      };
    });

    return { statements, rejections };
  }
}

module.exports = Cache;
