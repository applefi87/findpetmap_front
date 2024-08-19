import { boot } from 'quasar/wrappers'
import { createI18n } from 'vue-i18n'
import messages from 'src/i18n/index.js'

const i18n = createI18n({
  locale: 'en-US',
  globalInjection: true,
  messages: {
    'en-US': { name: "name" },
    'zh-TW': { name: "名稱" },
  },
  // legacy: false,
  // fallbackLocale: 'en-US',
  locale: 'en-US', // Set default locale
  fallbackLocale: 'en-US', // Set fallback locale
  missing: (locale, key) => {
    console.warn(`Missing translation key: ${key} in locale: ${locale}`);
  }
});

export default boot(({ app }) => {
  console.log(12);
  // Set i18n instance on app
  app.use(i18n);
});

// Export the i18n instance
export { i18n };
