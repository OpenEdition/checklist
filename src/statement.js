const Base = require("./base.js");

function getIdFromName (name) {
  return name.replace(/\W/gi, "-").toLowerCase();
}

// Get values from check, otherwise default values are inherited from check
function assignAttributes ({attributes, statement, infos, check}) {
  attributes.forEach((attr) => {
    statement[attr] = infos[attr] || check[attr];
  });
}

class Statement extends Base {
  constructor ({check, infos, caller}) {
    super("Statement", caller);
    this.check = check;
    this.docId = check.docId;

    assignAttributes({
      attributes: ["name", "description", "id"],
      statement: this,
      infos,
      check
    });
    this.count = 1;

    // If no id then create it from name
    if (this.id == null) {
      this.id = getIdFromName(this.name);
    }

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
