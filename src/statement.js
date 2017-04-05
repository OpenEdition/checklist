class Statement {
  constructor (infos) {
    if (typeof infos === "undefined") {
      throw Error("Statement constructor requires a name at least");
    } else if (typeof infos === "string") {
      this.name = infos;
    } else {
      const {name, description, id} = infos;
      Object.assign(this, {name, description, id});
    }

    // Create id from name if null
    if (this.id == null) {
      this.id = this.name.replace(/\W/gi, "-").toLowerCase();
    }
  }
}

module.exports = Statement;
