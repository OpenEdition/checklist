class Statement {
  constructor (infos) {
    if (typeof infos === "undefined") {
      throw Error("Statement constructor requires a name at least");
    } else if (typeof infos === "string") {
      this.name = infos;
    } else {
      const {name, description, id, count} = infos;
      Object.assign(this, {name, description, id, count});
    }

    // Create id from name if null
    if (this.id == null) {
      this.id = this.name.replace(/\W/gi, "-").toLowerCase();
    }
    this.count = this.count || 1;
  }
}

module.exports = Statement;
