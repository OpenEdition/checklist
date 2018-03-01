const i18next = require("i18next");

i18next.init({
  fallbackLng: "en",
  // TODO: load lng from config
  lng: "fr",
  debug: false,
}, function(err, t) {
  // initialized and ready to go!
  console.log("i18next ready!");
});
