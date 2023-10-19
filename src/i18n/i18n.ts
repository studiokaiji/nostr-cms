import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enJson from "./en.json";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: enJson,
    },
  }, // Where we're gonna put translations' files
  lng: "en", // Set the initial language of the App
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});
