const Base = require("./base.js");

function getIdFromName (name) {
  return name.replace(/\W/gi, "-").toLowerCase();
}

class Statement extends Base {
  constructor ({check, infos, caller}) {
    super("Statement", caller);
    this.check = check;
    this.docId = check.docId;

    // Get values from check, otherwise default values are inherited from check
    this.name = infos.name || check.name;
    this.description = infos.description || check.description;
    this.id = infos.id || check.id || getIdFromName(this.name);
    this.count = 1;

    // If infos is a string, then use it as the name
    if (typeof infos === "string") {
      this.name = infos;
      this.id = getIdFromName(this.name);
    }

    // Do we have a name here?
    if (this.name == null) {
      throw Error("Statement constructor requires a name at least");
    }

    // Generate an new id from name if only the name was specified
    if (infos.name && infos.id == null) {
      this.id = getIdFromName(this.name);
    }
  }

  add (nb = 1) {
    this.count += nb;
  }

  getDuplicate () {
    return this.check.statements.find((el) => {
      return this.is(el);
    });
  }

  is (statement) {
    return this.id === statement.id;
  }
}

module.exports = Statement;
