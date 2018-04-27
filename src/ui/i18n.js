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

function i18n ({ lang = "fr" }) {
  return new Promise((resolve, reject) => {
    const options = {
      fallbackLng: "fr",
      lng: lang,
      debug: false,
      resources: getLocales(),
    };
    i18next.init(options, (err, t) => {
      if (err) reject(err);
      // tk = translations from keys: {fr: "...", en: "..."}
      const tk = (arg) => {
        if (typeof arg === "string") return arg;
        return arg[lang] || arg[options.fallbackLng] || "";
      };
      resolve({t, tk});
    });
  });
}

module.exports = i18n;
