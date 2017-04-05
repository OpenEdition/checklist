class Statement {
  constructor (infos) {
    if (typeof infos === "undefined") {
      throw Error("Statement constructor requires a name at least");
    } else if (typeof infos === "string") {
      this.name = infos;
    } else {
      const {name, description} = infos;
      Object.assign(this, {name, description});
    }
  }
}

module.exports = Statement;
