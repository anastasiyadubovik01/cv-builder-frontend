import type { I18nConfig } from 'next-i18next/proxy';

const i18nConfig: I18nConfig = {
  supportedLngs: ['en', 'fr', 'de', 'it', 'pl', 'pt', 'ru', 'es', 'uk'],
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: ['common'],
  localeInPath: false,

  resourceLoader: (language, namespace) =>
    import(`./src/i18n/locales/${language}/${namespace}.json`),
};

export default i18nConfig;
