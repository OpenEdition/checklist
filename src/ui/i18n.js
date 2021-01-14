const i18next = require("i18next");

function getLocales (translations = {}) {
  const locales = {};
  const r = require.context('./locales/', false, /\.json$/);
  r.keys().forEach((key) => {
    const re = /[A-z]+(?=\.json$)/;
    const lang = (re.exec(key) || [])[0];
    if (lang == null) return;
    const defaultTranslations = r(key);
    locales[lang] = {
      translation: Object.assign(defaultTranslations, translations[lang])
    };
  });

  // Add locales directly defined in config when the related locales.json is missing
  Object.keys(translations).forEach((key) => {
    if (locales[key]) return;
    locales[key] = {
      translation: translations[key]
    }
  });
  
  return locales;
}

function i18n ({ lang = "fr", translations }) {
  return new Promise((resolve, reject) => {
    const options = {
      fallbackLng: "fr",
      lng: lang,
      debug: false,
      resources: getLocales(translations),
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
