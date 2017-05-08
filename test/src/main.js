function importAll (r) {
  r.keys().forEach(r);
}

require("./vars.js");
require("./utils.js");

importAll(require.context('../src/', false, /tests\.js$/));
