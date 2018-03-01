const i18next = require("i18next");

function getLocales () {
  const locales = {};
  const r = require.context('./locales/', false, /\.json$/);
  r.keys().forEach((key) => {
    const re = /[A-z]+(?=\.json$)/;
    const lang = (re.exec(key) || [])[0];
    if (lang == null) return;
    locales[lang] = r(key);
  });
  return locales;
}

i18next.init({
  fallbackLng: "en",
  // TODO: load lng from config
  lng: "fr",
  debug: false,
  resources: getLocales(),
}, function(err, t) {
  // initialized and ready to go!
  console.log("i18next ready!");
});
