class Statement {
  constructor ({check, infos}) {
    this.check = check;

    this.name = typeof infos === "string" ? infos : ((infos && infos.name) || check.name);

    if (this.name == null) {
      throw Error("Statement constructor requires a name at least");
    }

    // Create id from name if null
    this.id = (infos && infos.id) || this.name.replace(/\W/gi, "-").toLowerCase();
    this.description = (infos && infos.description) || check.description;
    this.count = typeof infos === "number" ? infos : ((infos && infos.count) || 1);
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
